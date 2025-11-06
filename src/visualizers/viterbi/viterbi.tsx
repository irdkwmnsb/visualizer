import { bind, here, update } from "."

type Matrix = number[][]
type Layer = {
    activeRows: number[]
    nodes: Array<{ first: number; second: number }>
}

// Helper function to get bit at index
const getBit = (v: number, index: number): number => {
    return (v >> index) & 1
}

// XOR two rows
const xorRow = (target: number[], source: number[]): void => {
    for (let i = 0; i < target.length; i++) {
        target[i] ^= source[i]
    }
}

// Convert generator matrix to minimal span form
const makeMinimalSpan = async (matrix: Matrix): Promise<void> => {
    // First make the beginnings unique
    let col = 0
    for (let rowToMakeUnique = 0; rowToMakeUnique < matrix.length; rowToMakeUnique++) {
        await here("msf_check_cell", { row: rowToMakeUnique, col, value: matrix[rowToMakeUnique][col], phase: "beginning" })
        
        if (matrix[rowToMakeUnique][col] === 0) {
            // Find a row to swap with
            for (let i = rowToMakeUnique + 1; i < matrix.length; i++) {
                if (matrix[i][col] === 1) {
                    await here("msf_swap", { row1: rowToMakeUnique, row2: i, col, phase: "beginning" })
                    ;[matrix[i], matrix[rowToMakeUnique]] = [matrix[rowToMakeUnique], matrix[i]]
                    await here("msf_after_swap", { matrix: matrix.map(r => [...r]), phase: "beginning" })
                    break
                }
            }
        }
        // If still zero, skip this column
        if (matrix[rowToMakeUnique][col] === 0) {
            await here("msf_skip_column", { col, phase: "beginning" })
            rowToMakeUnique--
            col++
            continue
        }
        // XOR all rows below that have 1 in this column
        const rowsToXor: number[] = []
        for (let i = rowToMakeUnique + 1; i < matrix.length; i++) {
            if (matrix[i][col] === 1) {
                rowsToXor.push(i)
            }
        }
        if (rowsToXor.length > 0) {
            await here("msf_before_xor", { sourceRow: rowToMakeUnique, targetRows: rowsToXor, col, phase: "beginning" })
            for (const i of rowsToXor) {
                xorRow(matrix[i], matrix[rowToMakeUnique])
            }
            await here("msf_after_xor", { matrix: matrix.map(r => [...r]), phase: "beginning" })
        }
        col++
    }
    
    // Then make the endings unique
    col = matrix[0].length - 1
    const isRowUnique = new Array(matrix.length).fill(false)
    for (let rowsToMakeUnique = matrix.length - 1; rowsToMakeUnique >= 0; rowsToMakeUnique--) {
        let found = false
        for (let lastNonZeroRow = matrix.length - 1; lastNonZeroRow >= 0; lastNonZeroRow--) {
            if (matrix[lastNonZeroRow][col] === 1 && !isRowUnique[lastNonZeroRow]) {
                await here("msf_check_cell", { row: lastNonZeroRow, col, value: 1, phase: "ending" })
                
                // Fix all other rows
                const rowsToXor: number[] = []
                for (let otherRow = lastNonZeroRow - 1; otherRow >= 0; otherRow--) {
                    if (matrix[otherRow][col] === 1) {
                        rowsToXor.push(otherRow)
                    }
                }
                if (rowsToXor.length > 0) {
                    await here("msf_before_xor", { sourceRow: lastNonZeroRow, targetRows: rowsToXor, col, phase: "ending" })
                    for (const otherRow of rowsToXor) {
                        xorRow(matrix[otherRow], matrix[lastNonZeroRow])
                    }
                    await here("msf_after_xor", { matrix: matrix.map(r => [...r]), phase: "ending" })
                }
                isRowUnique[lastNonZeroRow] = true
                found = true
                col--
                break
            }
        }
        if (!found) {
            await here("msf_skip_column", { col, phase: "ending" })
            col--
            rowsToMakeUnique++
        }
    }
}

    // Find active spans for all layers
    const findActive = async (msf: Matrix): Promise<number[][]> => {
        const starts = new Array(msf.length).fill(-1)
        const ends = new Array(msf.length).fill(-1)
        
        await here("find_active_find_starts", { starts: [...starts] })
        for (let column = 0; column < msf[0].length; column++) {
            for (let row = 0; row < msf.length; row++) {
                if (msf[row][column] === 1 && starts[row] === -1) {
                    starts[row] = column
                    await here("find_active_start_found", { row, column, starts: [...starts] })
                }
            }
        }
        
        await here("find_active_find_ends", { ends: [...ends] })
        for (let column = msf[0].length - 1; column >= 0; column--) {
            for (let row = 0; row < msf.length; row++) {
                if (msf[row][column] === 1 && ends[row] === -1) {
                    ends[row] = column
                    await here("find_active_end_found", { row, column, ends: [...ends] })
                }
            }
        }
        
        await here("find_active_starts_ends", { starts: [...starts], ends: [...ends] })
        
        const result: number[][] = []
        for (let column = 0; column < msf[0].length; column++) {
            result.push([])
            for (let row = 0; row < msf.length; row++) {
                if (starts[row] <= column && column < ends[row]) {
                    result[column].push(row)
                }
            }
            await here("find_active_column", { column, activeRows: [...result[column]], starts, ends })
        }
        return result
    }

// Bit scalar product
const bitScalar = (a: number[], b: number[]): number => {
    let result = 0
    for (let i = 0; i < a.length; i++) {
        result ^= a[i] & b[i]
    }
    return result
}

// Build the trellis grid
const makeGrid = async (msf: Matrix, updateGrid: (grid: Layer[]) => void): Promise<Layer[]> => {
    const result: Layer[] = []
    result.push({
        activeRows: [],
        nodes: [{ first: -1, second: -1 }]
    })
    
    await here("make_grid_init", { layer: result[0] })
    updateGrid([...result])
    
    const actives = await findActive(msf)
    
    for (let column = 0; column < msf[0].length; column++) {
        const numNodes = 1 << actives[column].length
        result.push({
            activeRows: actives[column],
            nodes: new Array(numNodes).fill(null).map(() => ({ first: -1, second: -1 }))
        })
        updateGrid([...result])
        await here("make_grid_add_layer", { column, layer: { activeRows: [...actives[column]], numNodes }, grid: [...result] })
    }
    
    for (let column = 0; column < msf[0].length; column++) {
        const now = result[column]
        const next = result[column + 1]
        
        await here("make_grid_process_column", { column, nowActiveRows: [...now.activeRows], nextActiveRows: [...next.activeRows] })
        
        // Find intersection and union of active rows
        const bothActive = now.activeRows.filter(row => next.activeRows.includes(row))
        const anyActive = [...new Set([...now.activeRows, ...next.activeRows])].sort((a, b) => a - b)
        
        const anyActiveMatrixCol = anyActive.map(row => msf[row][column])
        
        await here("make_grid_analyze_edges", { column, bothActive, anyActive, anyActiveMatrixCol })
        
        for (let maskNow = 0; maskNow < now.nodes.length; maskNow++) {
            for (let maskNext = 0; maskNext < next.nodes.length; maskNext++) {
                let shouldConnect = true
                
                // Check if bits match in both active
                for (const bothActiveIdx of bothActive) {
                    const bitInNow = now.activeRows.indexOf(bothActiveIdx)
                    const bitInNext = next.activeRows.indexOf(bothActiveIdx)
                    if (getBit(maskNow, bitInNow) !== getBit(maskNext, bitInNext)) {
                        shouldConnect = false
                        break
                    }
                }
                
                if (shouldConnect) {
                    // Determine bit values for any active rows
                    const bitValues: number[] = []
                    for (const anyActiveRow of anyActive) {
                        const bitInNowIdx = now.activeRows.indexOf(anyActiveRow)
                        if (bitInNowIdx !== -1) {
                            bitValues.push(getBit(maskNow, bitInNowIdx))
                        } else {
                            const bitInNextIdx = next.activeRows.indexOf(anyActiveRow)
                            if (bitInNextIdx !== -1) {
                                bitValues.push(getBit(maskNext, bitInNextIdx))
                            }
                        }
                    }
                    
                    const edgeValue = bitScalar(anyActiveMatrixCol, bitValues)
                    if (edgeValue === 0) {
                        result[column].nodes[maskNow].first = maskNext
                        updateGrid([...result])
                        await here("make_grid_add_edge", { column, fromNode: maskNow, toNode: maskNext, edgeValue: 0, grid: [...result] })
                    } else {
                        result[column].nodes[maskNow].second = maskNext
                        updateGrid([...result])
                        await here("make_grid_add_edge", { column, fromNode: maskNow, toNode: maskNext, edgeValue: 1, grid: [...result] })
                    }
                }
            }
        }
    }
    
    updateGrid([...result])
    await here("make_grid_complete", { grid: result })
    return result
}

// Decode using Viterbi algorithm
const decode = async (codeGrid: Layer[], encoded: number[]): Promise<number[]> => {
    const distance: Array<Array<[number, number, number]>> = []
    distance[0] = [[0, -1, -1]]
    
    await here("decode_init", { distance: distance[0][0] })
    
    for (let column = 0; column < encoded.length; column++) {
        const now = codeGrid[column]
        const next = codeGrid[column + 1]
        distance[column + 1] = new Array(next.nodes.length).fill(null).map(() => [Infinity, -1, -1])
        
        await here("decode_start_column", { column, receivedValue: encoded[column], numNodes: now.nodes.length })
        
        for (let node = 0; node < now.nodes.length; node++) {
            const currentDist = distance[column][node][0]
            if (currentDist === Infinity) continue
            
            // Traverse zero edge
            const toZero = now.nodes[node].first
            if (toZero !== -1) {
                const newDist = currentDist + encoded[column] * -1
                if (newDist < distance[column + 1][toZero][0]) {
                    distance[column + 1][toZero] = [newDist, node, 0]
                    await here("decode_update_distance", { 
                        column, 
                        fromNode: node, 
                        toNode: toZero, 
                        edgeValue: 0, 
                        oldDist: distance[column + 1][toZero][0] === Infinity ? "∞" : distance[column + 1][toZero][0],
                        newDist,
                        isBetter: true
                    })
                } else {
                    await here("decode_update_distance", { 
                        column, 
                        fromNode: node, 
                        toNode: toZero, 
                        edgeValue: 0, 
                        oldDist: distance[column + 1][toZero][0],
                        newDist,
                        isBetter: false
                    })
                }
            }
            
            // Traverse one edge
            const toOne = now.nodes[node].second
            if (toOne !== -1) {
                const newDist = currentDist + encoded[column] * 1
                if (newDist < distance[column + 1][toOne][0]) {
                    distance[column + 1][toOne] = [newDist, node, 1]
                    await here("decode_update_distance", { 
                        column, 
                        fromNode: node, 
                        toNode: toOne, 
                        edgeValue: 1, 
                        oldDist: distance[column + 1][toOne][0] === Infinity ? "∞" : distance[column + 1][toOne][0],
                        newDist,
                        isBetter: true
                    })
                } else {
                    await here("decode_update_distance", { 
                        column, 
                        fromNode: node, 
                        toNode: toOne, 
                        edgeValue: 1, 
                        oldDist: distance[column + 1][toOne][0],
                        newDist,
                        isBetter: false
                    })
                }
            }
        }
        
        const distances = distance[column + 1].map((d, i) => ({ node: i, dist: d[0] === Infinity ? "∞" : d[0], prev: d[1], bit: d[2] }))
        await here("decode_end_column", { column, distances })
    }
    
    // Backtrack to get the answer
    await here("decode_start_backtrack", {})
    const ans: number[] = []
    const path: Array<{ column: number, node: number, bit: number }> = []
    let curNode = 0
    for (let column = encoded.length; column > 0; column--) {
        const bit = distance[column][curNode][2]
        ans.push(bit)
        path.push({ column, node: curNode, bit })
        await here("decode_backtrack_step", { column, node: curNode, bit, prevNode: distance[column][curNode][1], path: [...path] })
        curNode = distance[column][curNode][1]
    }
    await here("decode_backtrack_complete", { decoded: [...ans].reverse() })
    return ans.reverse()
}

// Matrix multiplication for encoding
const mul = (a: number[], b: Matrix): number[] => {
    const ans = new Array(b[0].length).fill(0)
    for (let j = 0; j < b[0].length; j++) {
        for (let i = 0; i < b.length; i++) {
            ans[j] ^= a[i] & b[i][j]
        }
    }
    return ans
}

export const viterbi = async (generatorMatrix: Matrix, message: number[], noiseLevel: number = 0) => {
    bind("generatorMatrix", generatorMatrix)
    bind("originalMessage", message)
    
    // Convert to minimal span form
    const msf = generatorMatrix.map(row => [...row])
    await here("make_msf", msf)
    await makeMinimalSpan(msf)
    update("msf", msf)
    await here("msf_ready", msf)
    
    // Build trellis
    const codeGrid = await makeGrid(msf, (grid) => {
        update("codeGrid", grid)
    })
    update("codeGrid", codeGrid)
    await here("grid_ready", codeGrid)
    
    // Encode message
    const encoded = mul(message, generatorMatrix)
    update("encoded", encoded)
    await here("encoded", encoded)
    
    // Add noise if specified
    let received = encoded.map(bit => (1 - 2 * bit) as number)
    if (noiseLevel > 0) {
        const noise = received.map(() => {
            const sigma = Math.sqrt(0.5 * Math.pow(10, -noiseLevel / 10) * (generatorMatrix[0].length / generatorMatrix.length))
            return (Math.random() - 0.5) * 2 * sigma
        })
        received = received.map((val, i) => val + noise[i])
    }
    update("received", received)
    await here("received", received)
    
    // Decode
    const decoded = await decode(codeGrid, received)
    update("decoded", decoded)
    await here("decoded", decoded)
    
    // Check if decoding was correct
    const isCorrect = decoded.every((bit, i) => bit === encoded[i])
    update("isCorrect", isCorrect)
    await here("done", isCorrect)
}

export type ViterbiState = {
    generatorMatrix: Matrix
    originalMessage: number[]
    msf: Matrix
    codeGrid: Layer[]
    encoded: number[]
    received: number[]
    decoded: number[]
    isCorrect: boolean
    activeSpans?: { starts: number[], ends: number[], columnActiveRows?: number[][] }
    decodeDistances?: Array<{ node: number, dist: number | string, prev: number, bit: number }>
    decodePath?: Array<{ column: number, node: number, bit: number }>
}

export type ViterbiEvent = 
    | { name: "make_msf"; args: [Matrix] }
    | { name: "msf_ready"; args: [Matrix] }
    | { name: "msf_check_cell"; args: [{ row: number, col: number, value: number, phase: string }] }
    | { name: "msf_swap"; args: [{ row1: number, row2: number, col: number, phase: string }] }
    | { name: "msf_after_swap"; args: [{ matrix: Matrix, phase: string }] }
    | { name: "msf_skip_column"; args: [{ col: number, phase: string }] }
    | { name: "msf_before_xor"; args: [{ sourceRow: number, targetRows: number[], col: number, phase: string }] }
    | { name: "msf_after_xor"; args: [{ matrix: Matrix, phase: string }] }
    | { name: "find_active_find_starts"; args: [{ starts: number[] }] }
    | { name: "find_active_start_found"; args: [{ row: number, column: number, starts: number[] }] }
    | { name: "find_active_find_ends"; args: [{ ends: number[] }] }
    | { name: "find_active_end_found"; args: [{ row: number, column: number, ends: number[] }] }
    | { name: "find_active_starts_ends"; args: [{ starts: number[], ends: number[] }] }
    | { name: "find_active_column"; args: [{ column: number, activeRows: number[], starts: number[], ends: number[] }] }
    | { name: "make_grid_init"; args: [{ layer: Layer }] }
    | { name: "make_grid_add_layer"; args: [{ column: number, layer: { activeRows: number[], numNodes: number }, grid: Layer[] }] }
    | { name: "make_grid_process_column"; args: [{ column: number, nowActiveRows: number[], nextActiveRows: number[] }] }
    | { name: "make_grid_analyze_edges"; args: [{ column: number, bothActive: number[], anyActive: number[], anyActiveMatrixCol: number[] }] }
    | { name: "make_grid_add_edge"; args: [{ column: number, fromNode: number, toNode: number, edgeValue: number, grid: Layer[] }] }
    | { name: "make_grid_complete"; args: [{ grid: Layer[] }] }
    | { name: "grid_ready"; args: [Layer[]] }
    | { name: "encoded"; args: [number[]] }
    | { name: "received"; args: [number[]] }
    | { name: "decode_init"; args: [{ distance: [number, number, number] }] }
    | { name: "decode_start_column"; args: [{ column: number, receivedValue: number, numNodes: number }] }
    | { name: "decode_update_distance"; args: [{ column: number, fromNode: number, toNode: number, edgeValue: number, oldDist: number | string, newDist: number, isBetter: boolean }] }
    | { name: "decode_end_column"; args: [{ column: number, distances: Array<{ node: number, dist: number | string, prev: number, bit: number }> }] }
    | { name: "decode_start_backtrack"; args: [{}] }
    | { name: "decode_backtrack_step"; args: [{ column: number, node: number, bit: number, prevNode: number, path: Array<{ column: number, node: number, bit: number }> }] }
    | { name: "decode_backtrack_complete"; args: [{ decoded: number[] }] }
    | { name: "decoded"; args: [number[]] }
    | { name: "done"; args: [boolean] }

export type ViterbiArguments = Parameters<typeof viterbi>

