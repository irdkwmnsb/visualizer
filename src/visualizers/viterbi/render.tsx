import { RenderProps } from "../../core/manifest"
import { ViterbiEvent, ViterbiState } from "./viterbi"
import { VisArray } from "../../components/array/array"
import { Color } from "../../visuals/colors"
import { VisNDArray } from "../../components/array/ndarray"
import { useEffect, useRef } from "react"

type Point = { x: number; y: number }
type Layer = {
    activeRows: number[]
    nodes: Array<{ first: number; second: number }>
}

// Get highlights for MSF matrix based on current event
const getMSFHighlights = (curEvent: ViterbiEvent, msf: number[][] | undefined): {
    highlightCells?: Record<string, Color>
    highlightRows?: Record<number, Color>
    highlightColumns?: Record<number, Color>
} => {
    if (!msf) return {}
    
    const highlightCells: Record<string, Color> = {}
    const highlightRows: Record<number, Color> = {}
    const highlightColumns: Record<number, Color> = {}
    
    if (curEvent.name === "msf_check_cell") {
        const data = curEvent.args[0] as { row: number, col: number, value: number, phase: string }
        highlightCells[`${data.row},${data.col}`] = Color.BLUE
        highlightColumns[data.col] = Color.BLUE
    } else if (curEvent.name === "msf_swap") {
        const data = curEvent.args[0] as { row1: number, row2: number, col: number, phase: string }
        highlightRows[data.row1] = Color.RED
        highlightRows[data.row2] = Color.YELLOW
        highlightColumns[data.col] = Color.BLUE
        // Highlight the cells being swapped
        for (let c = 0; c < msf[0].length; c++) {
            highlightCells[`${data.row1},${c}`] = Color.RED
            highlightCells[`${data.row2},${c}`] = Color.YELLOW
        }
    } else if (curEvent.name === "msf_before_xor" || curEvent.name === "msf_after_xor") {
        const data = curEvent.args[0] as { sourceRow: number, targetRows: number[], col: number, phase: string } | { matrix: number[][], phase: string }
        if ("sourceRow" in data) {
            highlightRows[data.sourceRow] = Color.BLUE
            data.targetRows.forEach((row: number) => {
                highlightRows[row] = Color.YELLOW
            })
            highlightColumns[data.col] = Color.BLUE
            // Highlight cells in the column
            highlightCells[`${data.sourceRow},${data.col}`] = Color.BLUE
            data.targetRows.forEach((row: number) => {
                highlightCells[`${row},${data.col}`] = Color.YELLOW
            })
        }
    } else if (curEvent.name === "msf_skip_column") {
        const data = curEvent.args[0] as { col: number, phase: string }
        highlightColumns[data.col] = Color.YELLOW
    } else if (curEvent.name === "find_active_start_found") {
        const data = curEvent.args[0] as { row: number, column: number }
        highlightCells[`${data.row},${data.column}`] = Color.GREEN
        highlightColumns[data.column] = Color.BLUE
    } else if (curEvent.name === "find_active_end_found") {
        const data = curEvent.args[0] as { row: number, column: number }
        highlightCells[`${data.row},${data.column}`] = Color.GREEN
        highlightColumns[data.column] = Color.BLUE
    } else if (curEvent.name === "find_active_column") {
        const data = curEvent.args[0] as { column: number, activeRows: number[] }
        highlightColumns[data.column] = Color.BLUE
        data.activeRows.forEach((row: number) => {
            highlightRows[row] = Color.GREEN
            // Highlight all cells in active rows for this column
            highlightCells[`${row},${data.column}`] = Color.GREEN
        })
    } else if (curEvent.name === "make_grid_process_column") {
        const data = curEvent.args[0] as { column: number, nowActiveRows: number[], nextActiveRows: number[] }
        highlightColumns[data.column] = Color.BLUE
        // Highlight rows that are active in either layer
        const allActive = [...new Set([...data.nowActiveRows, ...data.nextActiveRows])]
        allActive.forEach((row: number) => {
            highlightRows[row] = Color.YELLOW
        })
    } else if (curEvent.name === "decode_start_column" || curEvent.name === "decode_end_column") {
        const data = curEvent.args[0] as { column: number }
        highlightColumns[data.column] = Color.GREEN
    } else if (curEvent.name === "decode_update_distance") {
        const data = curEvent.args[0] as { column: number, isBetter: boolean }
        highlightColumns[data.column] = data.isBetter ? Color.GREEN : Color.YELLOW
    } else if (curEvent.name === "decode_backtrack_step") {
        const data = curEvent.args[0] as { column: number }
        highlightColumns[data.column] = Color.GREEN
    }
    
    return {
        highlightCells: Object.keys(highlightCells).length > 0 ? highlightCells : undefined,
        highlightRows: Object.keys(highlightRows).length > 0 ? highlightRows : undefined,
        highlightColumns: Object.keys(highlightColumns).length > 0 ? highlightColumns : undefined
    }
}

export const ViterbiRender = ({ curState, curEvent }: RenderProps<ViterbiState, ViterbiEvent>) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    useEffect(() => {
        if (!canvasRef.current) return
        
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Get codeGrid from state or from event data during construction
        let codeGrid = curState.codeGrid
        if (!codeGrid && curEvent.name.startsWith("make_grid_")) {
            if (curEvent.name === "make_grid_add_layer" || curEvent.name === "make_grid_add_edge") {
                const data = curEvent.args[0] as { grid?: Layer[] }
                if (data.grid) {
                    codeGrid = data.grid
                }
            }
        }
        
        // Only draw trellis if we have a codeGrid
        if (codeGrid) {
            const layerWidth = 150
            const nodeHeight = 40
            const startX = 50
            const startY = 50
            
            // Calculate positions for all nodes
            const nodePositions: Point[][] = []
            for (let layer = 0; layer < codeGrid.length; layer++) {
                const nodes = codeGrid[layer].nodes
                const positions: Point[] = []
                const totalHeight = nodes.length * nodeHeight
                const offsetY = (canvas.height - totalHeight) / 2
                
                for (let node = 0; node < nodes.length; node++) {
                    positions.push({
                        x: startX + layer * layerWidth,
                        y: offsetY + node * nodeHeight
                    })
                }
                nodePositions.push(positions)
            }
            
            // Determine which layers/edges to show based on current event
            let maxLayerToShow = codeGrid.length
            let edgesToHighlight: Set<string> = new Set()
            let currentColumn = -1
            
            // During grid construction, only show layers up to the current one
            if (curEvent.name === "make_grid_add_layer") {
                const data = curEvent.args[0] as { column: number }
                maxLayerToShow = data.column + 2 // Show up to the layer being added
                currentColumn = data.column
            } else if (curEvent.name === "make_grid_add_edge") {
                const data = curEvent.args[0] as { column: number, fromNode: number, toNode: number, edgeValue: number }
                // Store edge key in format: layer-fromNode-toNode-edgeValue
                edgesToHighlight.add(`${data.column}-${data.fromNode}-${data.toNode}-${data.edgeValue}`)
                currentColumn = data.column
            } else if (curEvent.name === "make_grid_process_column") {
                const data = curEvent.args[0] as { column: number }
                currentColumn = data.column
            }
            
            // Draw edges
            for (let layer = 0; layer < Math.min(codeGrid.length - 1, maxLayerToShow - 1); layer++) {
                const now = codeGrid[layer]
                const nowPos = nodePositions[layer]
                const nextPos = nodePositions[layer + 1]
                
                for (let node = 0; node < now.nodes.length; node++) {
                    const from = nowPos[node]
                    
                    // Check if this edge should be highlighted
                    const edgeKey0 = `${layer}-${node}-${now.nodes[node].first}-0`
                    const edgeKey1 = `${layer}-${node}-${now.nodes[node].second}-1`
                    const highlightEdge0 = edgesToHighlight.has(edgeKey0)
                    const highlightEdge1 = edgesToHighlight.has(edgeKey1)
                    
                    // During grid construction, fade edges that haven't been created yet
                    const isCurrentColumn = layer === currentColumn
                    const shouldFade = currentColumn !== -1 && layer > currentColumn
                    
                    // Draw zero edge
                    if (now.nodes[node].first !== -1) {
                        const to = nextPos[now.nodes[node].first]
                        ctx.strokeStyle = highlightEdge0 ? "#00aaff" : "#00aaff"
                        ctx.lineWidth = highlightEdge0 ? 5 : (isCurrentColumn ? 2 : 1)
                        ctx.globalAlpha = highlightEdge0 ? 1.0 : (shouldFade ? 0.3 : 0.6)
                        ctx.beginPath()
                        ctx.moveTo(from.x, from.y)
                        ctx.lineTo(to.x, to.y)
                        ctx.stroke()
                        
                        // Draw bit label on highlighted edge
                        if (highlightEdge0) {
                            const midX = (from.x + to.x) / 2
                            const midY = (from.y + to.y) / 2
                            ctx.fillStyle = "#fff"
                            ctx.strokeStyle = "#00aaff"
                            ctx.lineWidth = 2
                            ctx.beginPath()
                            ctx.arc(midX, midY, 7, 0, 2 * Math.PI)
                            ctx.fill()
                            ctx.stroke()
                            ctx.fillStyle = "#00aaff"
                            ctx.font = "bold 9px Arial"
                            ctx.textAlign = "center"
                            ctx.fillText("0", midX, midY + 3)
                        }
                        ctx.globalAlpha = 1.0
                    }
                    
                    // Draw one edge
                    if (now.nodes[node].second !== -1) {
                        const to = nextPos[now.nodes[node].second]
                        ctx.strokeStyle = highlightEdge1 ? "#ff6600" : "#ff6600"
                        ctx.lineWidth = highlightEdge1 ? 5 : (isCurrentColumn ? 2 : 1)
                        ctx.globalAlpha = highlightEdge1 ? 1.0 : (shouldFade ? 0.3 : 0.6)
                        ctx.beginPath()
                        ctx.moveTo(from.x, from.y)
                        ctx.lineTo(to.x, to.y)
                        ctx.stroke()
                        
                        // Draw bit label on highlighted edge
                        if (highlightEdge1) {
                            const midX = (from.x + to.x) / 2
                            const midY = (from.y + to.y) / 2
                            ctx.fillStyle = "#fff"
                            ctx.strokeStyle = "#ff6600"
                            ctx.lineWidth = 2
                            ctx.beginPath()
                            ctx.arc(midX, midY, 7, 0, 2 * Math.PI)
                            ctx.fill()
                            ctx.stroke()
                            ctx.fillStyle = "#ff6600"
                            ctx.font = "bold 9px Arial"
                            ctx.textAlign = "center"
                            ctx.fillText("1", midX, midY + 3)
                        }
                        ctx.globalAlpha = 1.0
                    }
                }
            }
            
            // Highlight decoding path and distances
            // Draw distance labels for all columns if we have decode distances
            if (curState.decodeDistances && curEvent.name === "decode_end_column") {
                const { column, distances } = curEvent.args[0] as { column: number, distances: Array<{ node: number, dist: number | string, prev: number, bit: number }> }
                if (column < nodePositions.length - 1) {
                    const positions = nodePositions[column + 1]
                    distances.forEach((d: any) => {
                        if (d.node < positions.length) {
                            const pos = positions[d.node]
                            ctx.fillStyle = "#000"
                            ctx.font = "10px Arial"
                            ctx.textAlign = "left"
                            const distText = d.dist === Infinity || d.dist === "∞" ? "∞" : d.dist.toFixed(2)
                            ctx.fillText(distText, pos.x + 12, pos.y)
                        }
                    })
                }
            }
            
            // Highlight path being explored
            if (curEvent.name === "decode_update_distance") {
                const data = curEvent.args[0] as { column: number, fromNode: number, toNode: number, isBetter: boolean }
                if (data.column < nodePositions.length - 1) {
                    const from = nodePositions[data.column][data.fromNode]
                    const to = nodePositions[data.column + 1][data.toNode]
                    ctx.strokeStyle = data.isBetter ? Color.GREEN : "#aaa"
                    ctx.lineWidth = data.isBetter ? 3 : 1
                    ctx.setLineDash(data.isBetter ? [] : [5, 5])
                    ctx.beginPath()
                    ctx.moveTo(from.x, from.y)
                    ctx.lineTo(to.x, to.y)
                    ctx.stroke()
                    ctx.setLineDash([])
                }
            }
            
            // Draw backtracking path step by step
            if (curEvent.name === "decode_backtrack_step") {
                const data = curEvent.args[0] as { column: number, node: number, bit: number, prevNode: number, path: Array<{ column: number, node: number, bit: number }> }
                
                // Draw the backtrack path so far
                // Path is built in reverse order (from end to start), so we need to reverse it for visualization
                if (data.path && data.path.length > 0) {
                    ctx.strokeStyle = Color.GREEN
                    ctx.lineWidth = 4
                    ctx.setLineDash([5, 5])
                    
                    // Sort path by column to draw from start to end
                    const sortedPath = [...data.path].sort((a, b) => a.column - b.column)
                    
                    // Draw path segments
                    for (let i = 0; i < sortedPath.length; i++) {
                        const step = sortedPath[i]
                        if (step.column > 0 && step.column < codeGrid.length) {
                            // Find the previous node
                            let prevNode = -1
                            if (i > 0) {
                                // Previous step in sorted path
                                const prevStep = sortedPath[i - 1]
                                if (prevStep.column === step.column - 1) {
                                    prevNode = prevStep.node
                                }
                            }
                            
                            // If we couldn't find it from path, use the trellis structure
                            if (prevNode === -1) {
                                for (let n = 0; n < codeGrid[step.column - 1].nodes.length; n++) {
                                    if (step.bit === 0 && codeGrid[step.column - 1].nodes[n].first === step.node) {
                                        prevNode = n
                                        break
                                    } else if (step.bit === 1 && codeGrid[step.column - 1].nodes[n].second === step.node) {
                                        prevNode = n
                                        break
                                    }
                                }
                            }
                            
                            if (prevNode !== -1 && step.column > 0) {
                                const from = nodePositions[step.column - 1][prevNode]
                                const to = nodePositions[step.column][step.node]
                                ctx.beginPath()
                                ctx.moveTo(from.x, from.y)
                                ctx.lineTo(to.x, to.y)
                                ctx.stroke()
                                
                                // Draw bit value on the edge
                                const midX = (from.x + to.x) / 2
                                const midY = (from.y + to.y) / 2
                                ctx.fillStyle = "#fff"
                                ctx.strokeStyle = Color.GREEN
                                ctx.lineWidth = 2
                                ctx.beginPath()
                                ctx.arc(midX, midY, 8, 0, 2 * Math.PI)
                                ctx.fill()
                                ctx.stroke()
                                ctx.fillStyle = "#000"
                                ctx.font = "bold 9px Arial"
                                ctx.textAlign = "center"
                                ctx.fillText(step.bit.toString(), midX, midY + 3)
                            }
                        }
                    }
                    ctx.setLineDash([])
                }
                
                // Draw edge from prevNode to current node
                if (data.prevNode !== -1 && data.column > 0 && data.column < nodePositions.length) {
                    const from = nodePositions[data.column - 1][data.prevNode]
                    const to = nodePositions[data.column][data.node]
                    ctx.strokeStyle = Color.GREEN
                    ctx.lineWidth = 5
                    ctx.beginPath()
                    ctx.moveTo(from.x, from.y)
                    ctx.lineTo(to.x, to.y)
                    ctx.stroke()
                }
                
                // Highlight current backtrack node
                if (data.column < nodePositions.length && data.column >= 0) {
                    const pos = nodePositions[data.column][data.node]
                    ctx.fillStyle = Color.YELLOW
                    ctx.strokeStyle = Color.GREEN
                    ctx.lineWidth = 4
                    ctx.beginPath()
                    ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.stroke()
                    
                    // Draw bit label
                    ctx.fillStyle = "#000"
                    ctx.font = "bold 11px Arial"
                    ctx.textAlign = "center"
                    ctx.fillText(`bit:${data.bit}`, pos.x, pos.y + 20)
                }
            }
            
            // Draw final decoded path (when complete)
            if (curState.decoded && curState.decoded.length > 0 && (curEvent.name === "decoded" || curEvent.name === "done")) {
                ctx.strokeStyle = Color.GREEN
                ctx.lineWidth = 4
                
                let currentNode = 0
                for (let col = 0; col < curState.decoded.length; col++) {
                    const decodedBit = curState.decoded[col]
                    const from = nodePositions[col][currentNode]
                    
                    let nextNode = -1
                    if (decodedBit === 0 && codeGrid[col].nodes[currentNode].first !== -1) {
                        nextNode = codeGrid[col].nodes[currentNode].first
                    } else if (decodedBit === 1 && codeGrid[col].nodes[currentNode].second !== -1) {
                        nextNode = codeGrid[col].nodes[currentNode].second
                    }
                    
                    if (nextNode !== -1) {
                        const to = nodePositions[col + 1][nextNode]
                        ctx.beginPath()
                        ctx.moveTo(from.x, from.y)
                        ctx.lineTo(to.x, to.y)
                        ctx.stroke()
                        
                        // Highlight nodes in the path
                        ctx.fillStyle = Color.GREEN
                        ctx.strokeStyle = Color.GREEN
                        ctx.lineWidth = 3
                        ctx.beginPath()
                        ctx.arc(to.x, to.y, 10, 0, 2 * Math.PI)
                        ctx.fill()
                        ctx.stroke()
                        
                        currentNode = nextNode
                    }
                }
            }
            
            // Draw nodes
            for (let layer = 0; layer < Math.min(nodePositions.length, maxLayerToShow); layer++) {
                const positions = nodePositions[layer]
                for (let node = 0; node < positions.length; node++) {
                    const pos = positions[node]
                    
                    // Determine node highlighting
                    let highlightNode = false
                    let highlightColor = "#fff"
                    let strokeColor = "#000"
                    let strokeWidth = 2
                    let nodeSize = 8
                    
                    // Highlight during grid construction
                    if (curEvent.name === "make_grid_add_layer") {
                        const data = curEvent.args[0] as { column: number }
                        if (layer === data.column + 1) {
                            highlightNode = true
                            highlightColor = Color.YELLOW
                            strokeColor = Color.BLUE
                            strokeWidth = 3
                            nodeSize = 10
                        }
                    }
                    
                    // Highlight during decoding
                    if (curEvent.name === "decode_update_distance") {
                        const data = curEvent.args[0] as { column: number, fromNode: number, toNode: number, isBetter: boolean }
                        if (layer === data.column && data.fromNode === node) {
                            highlightNode = true
                            highlightColor = Color.BLUE
                            strokeColor = Color.BLUE
                            strokeWidth = 3
                            nodeSize = 10
                        } else if (layer === data.column + 1 && data.toNode === node) {
                            highlightNode = true
                            highlightColor = data.isBetter ? Color.GREEN : Color.YELLOW
                            strokeColor = data.isBetter ? Color.GREEN : Color.RED
                            strokeWidth = 3
                            nodeSize = 10
                        }
                    } else if (curEvent.name === "decode_backtrack_step") {
                        const data = curEvent.args[0] as { column: number, node: number }
                        if (layer === data.column && data.node === node) {
                            highlightNode = true
                            highlightColor = Color.YELLOW
                            strokeColor = Color.GREEN
                            strokeWidth = 4
                            nodeSize = 12
                        }
                    }
                    
                    // Draw node
                    ctx.fillStyle = highlightNode ? highlightColor : "#fff"
                    ctx.strokeStyle = highlightNode ? strokeColor : "#000"
                    ctx.lineWidth = highlightNode ? strokeWidth : 2
                    ctx.beginPath()
                    ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.stroke()
                    
                    // Label node
                    ctx.fillStyle = "#000"
                    ctx.font = "10px Arial"
                    ctx.textAlign = "center"
                    ctx.fillText(node.toString(), pos.x, pos.y - nodeSize - 4)
                }
            }
            
            // Draw layer labels
            ctx.fillStyle = "#000"
            ctx.font = "12px Arial"
            ctx.textAlign = "center"
            for (let layer = 0; layer < Math.min(codeGrid.length, maxLayerToShow); layer++) {
                const x = startX + layer * layerWidth
                let labelColor = "#000"
                let labelWeight = "normal"
                
                // Highlight current layer during construction
                if (curEvent.name === "make_grid_add_layer") {
                    const data = curEvent.args[0] as { column: number }
                    if (layer === data.column + 1) {
                        labelColor = Color.BLUE
                        labelWeight = "bold"
                    }
                } else if (curEvent.name === "make_grid_process_column") {
                    const data = curEvent.args[0] as { column: number }
                    if (layer === data.column || layer === data.column + 1) {
                        labelColor = Color.BLUE
                        labelWeight = "bold"
                    }
                } else if (curEvent.name.startsWith("decode_")) {
                    const data = curEvent.args[0] as { column?: number }
                    if (data.column !== undefined && (layer === data.column || layer === data.column + 1)) {
                        labelColor = Color.GREEN
                        labelWeight = "bold"
                    }
                }
                
                ctx.fillStyle = labelColor
                ctx.font = `${labelWeight} 12px Arial`
                ctx.fillText(`L${layer}`, x, startY - 20)
            }
        }
    }, [curState, curEvent])
    
    // Determine which matrix to show
    const getMatrixToShow = (): number[][] | undefined => {
        if (curEvent.name === "msf_after_swap" || curEvent.name === "msf_after_xor") {
            const data = curEvent.args[0] as { matrix?: number[][], phase: string }
            if (data.matrix) return data.matrix
        }
        if (curState.msf) return curState.msf
        return curState.generatorMatrix
    }
    
    const matrixToShow = getMatrixToShow()
    const msfHighlights = getMSFHighlights(curEvent, curState.msf || curState.generatorMatrix)
    
    // Get current step description
    const getStepDescription = (): string => {
        if (curEvent.name.startsWith("msf_")) {
            if (curEvent.name === "msf_check_cell") {
                const data = curEvent.args[0] as { row: number, col: number, phase: string }
                return `Checking cell [${data.row}, ${data.col}] (${data.phase} phase)`
            } else if (curEvent.name === "msf_swap") {
                const data = curEvent.args[0] as { row1: number, row2: number, col: number, phase: string }
                return `Swapping rows ${data.row1} and ${data.row2} at column ${data.col} (${data.phase} phase)`
            } else if (curEvent.name === "msf_before_xor") {
                const data = curEvent.args[0] as { sourceRow: number, targetRows: number[], col: number, phase: string }
                return `XORing row ${data.sourceRow} into rows [${data.targetRows.join(", ")}] at column ${data.col} (${data.phase} phase)`
            } else if (curEvent.name === "msf_skip_column") {
                const data = curEvent.args[0] as { col: number, phase: string }
                return `Skipping column ${data.col} (${data.phase} phase)`
            }
            return "Processing Minimal Span Form"
        } else if (curEvent.name.startsWith("find_active_")) {
            if (curEvent.name === "find_active_start_found") {
                const data = curEvent.args[0] as { row: number, column: number }
                return `Found start for row ${data.row} at column ${data.column}`
            } else if (curEvent.name === "find_active_end_found") {
                const data = curEvent.args[0] as { row: number, column: number }
                return `Found end for row ${data.row} at column ${data.column}`
            } else if (curEvent.name === "find_active_column") {
                const data = curEvent.args[0] as { column: number, activeRows: number[] }
                return `Column ${data.column}: Active rows [${data.activeRows.join(", ")}]`
            }
            return "Finding Active Spans"
        } else if (curEvent.name.startsWith("make_grid_")) {
            if (curEvent.name === "make_grid_add_layer") {
                const data = curEvent.args[0] as { column: number, layer: { activeRows: number[], numNodes: number } }
                return `Adding layer ${data.column} with ${data.layer.numNodes} nodes (active rows: [${data.layer.activeRows.join(", ")}])`
            } else if (curEvent.name === "make_grid_add_edge") {
                const data = curEvent.args[0] as { column: number, fromNode: number, toNode: number, edgeValue: number }
                return `Adding edge: Node ${data.fromNode} → Node ${data.toNode} (value: ${data.edgeValue})`
            }
            return "Building Trellis Grid"
        } else if (curEvent.name.startsWith("decode_")) {
            if (curEvent.name === "decode_start_column") {
                const data = curEvent.args[0] as { column: number, receivedValue: number }
                return `Processing column ${data.column}, received value: ${data.receivedValue.toFixed(3)}`
            } else if (curEvent.name === "decode_update_distance") {
                const data = curEvent.args[0] as { fromNode: number, toNode: number, isBetter: boolean, newDist: number }
                return `${data.isBetter ? "✓" : "✗"} Node ${data.fromNode} → Node ${data.toNode}, distance: ${data.newDist.toFixed(3)}`
            } else if (curEvent.name === "decode_backtrack_step") {
                const data = curEvent.args[0] as { column: number, node: number, bit: number }
                return `Backtrack: Column ${data.column}, Node ${data.node}, Bit: ${data.bit}`
            }
            return "Viterbi Decoding"
        }
        return curEvent.name
    }
    
    return <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px" }}>
        {/* Current Step */}
        <div style={{ padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", border: "2px solid #ccc" }}>
            <strong>Current Step:</strong> {getStepDescription()}
        </div>
        
        {/* Generator Matrix - Always show */}
        {curState.generatorMatrix && (
            <div>
                <h3>Generator Matrix</h3>
                <VisNDArray 
                    array={curState.generatorMatrix} 
                    label="Generator Matrix"
                    {...(curState.msf ? {} : msfHighlights)}
                />
            </div>
        )}
        
        {/* MSF - Always show when available */}
        {curState.msf && (
            <div>
                <h3>
                    {curEvent.name.startsWith("msf_") && typeof curEvent.args[0] === "object" && curEvent.args[0] !== null && "phase" in curEvent.args[0] && (curEvent.args[0] as { phase: string }).phase === "beginning" 
                        ? "Minimal Span Form (Making Beginnings Unique)" 
                        : curEvent.name.startsWith("msf_") && typeof curEvent.args[0] === "object" && curEvent.args[0] !== null && "phase" in curEvent.args[0] && (curEvent.args[0] as { phase: string }).phase === "ending"
                        ? "Minimal Span Form (Making Endings Unique)"
                        : "Minimal Span Form"}
                </h3>
                {matrixToShow && (
                    <div>
                        <VisNDArray 
                            array={matrixToShow} 
                            label="MSF Matrix"
                            highlightCells={msfHighlights.highlightCells}
                            highlightRows={msfHighlights.highlightRows}
                            highlightColumns={msfHighlights.highlightColumns}
                        />
                        {curEvent.name === "msf_swap" && (
                            <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#ffe8e8", borderRadius: "3px" }}>
                                <strong>Action:</strong> Swapping rows {(curEvent.args[0] as { row1: number, row2: number, col: number, phase: string }).row1} and {(curEvent.args[0] as { row1: number, row2: number, col: number, phase: string }).row2} at column {(curEvent.args[0] as { row1: number, row2: number, col: number, phase: string }).col}
                            </div>
                        )}
                        {curEvent.name === "msf_before_xor" && "sourceRow" in curEvent.args[0] && (
                            <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#e8f4f8", borderRadius: "3px" }}>
                                <strong>Action:</strong> XORing row {(curEvent.args[0] as { sourceRow: number, targetRows: number[], col: number, phase: string }).sourceRow} into rows [{(curEvent.args[0] as { sourceRow: number, targetRows: number[], col: number, phase: string }).targetRows.join(", ")}] at column {(curEvent.args[0] as { sourceRow: number, targetRows: number[], col: number, phase: string }).col}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        
        {/* Active Spans - Always show when available */}
        {curState.activeSpans && (
            <div>
                <h3>Active Spans</h3>
                <div style={{ display: "flex", gap: "20px" }}>
                    <div>
                        <strong>Row Starts:</strong>
                        <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "5px" }}>
                            {curState.activeSpans.starts.map((s, i) => (
                                <div key={i}>Row {i}: Column {s === -1 ? "N/A" : s}</div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <strong>Row Ends:</strong>
                        <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "5px" }}>
                            {curState.activeSpans.ends.map((e, i) => (
                                <div key={i}>Row {i}: Column {e === -1 ? "N/A" : e}</div>
                            ))}
                        </div>
                    </div>
                </div>
                {curState.activeSpans.columnActiveRows && (
                    <div style={{ marginTop: "10px" }}>
                        <strong>Active Rows by Column:</strong>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", marginTop: "5px" }}>
                            {curState.activeSpans.columnActiveRows.map((rows, col) => (
                                <div key={col}>Column {col}: [{rows.join(", ")}]</div>
                            ))}
                        </div>
                    </div>
                )}
                {curEvent.name === "find_active_column" && (
                    <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#e8f4f8", borderRadius: "3px" }}>
                        <strong>Current:</strong> Column {(curEvent.args[0] as { column: number, activeRows: number[] }).column}, Active rows: [{(curEvent.args[0] as { column: number, activeRows: number[] }).activeRows.join(", ")}]
                    </div>
                )}
            </div>
        )}
        
        {/* Trellis Diagram - Always show when available */}
        {curState.codeGrid && (
            <div>
                <h3>Trellis Diagram</h3>
                {curEvent.name.startsWith("make_grid_") && (
                    <div style={{ marginBottom: "10px", padding: "5px", backgroundColor: "#e8f4f8", borderRadius: "3px" }}>
                        {curEvent.name === "make_grid_add_layer" && (
                            <div><strong>Action:</strong> Adding layer {(curEvent.args[0] as { column: number, layer: { activeRows: number[], numNodes: number } }).column} with {(curEvent.args[0] as { column: number, layer: { activeRows: number[], numNodes: number } }).layer.numNodes} nodes (active rows: [{(curEvent.args[0] as { column: number, layer: { activeRows: number[], numNodes: number } }).layer.activeRows.join(", ")}])</div>
                        )}
                        {curEvent.name === "make_grid_add_edge" && (
                            <div><strong>Action:</strong> Adding edge: Node {(curEvent.args[0] as { fromNode: number, toNode: number, edgeValue: number }).fromNode} → Node {(curEvent.args[0] as { fromNode: number, toNode: number, edgeValue: number }).toNode} (value: {(curEvent.args[0] as { edgeValue: number }).edgeValue})</div>
                        )}
                    </div>
                )}
                <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={400}
                    style={{ border: "1px solid #ccc", backgroundColor: "#f9f9f9" }}
                />
                <div style={{ marginTop: "10px", fontSize: "12px" }}>
                    <span style={{ color: "#00aaff" }}>Blue edges: 0</span> | 
                    <span style={{ color: "#ff6600" }}> Orange edges: 1</span>
                    {curState.decoded && <span> | <span style={{ color: Color.GREEN }}>Green: Decoded path</span></span>}
                </div>
            </div>
        )}
        
        {/* Decoding Information - Always show when decoding */}
        {(curEvent.name.startsWith("decode_") || curState.decoded) && (
            <div>
                <h3>Viterbi Decoding</h3>
                {curEvent.name === "decode_start_column" && (
                    <div style={{ padding: "5px", backgroundColor: "#e8f4f8", borderRadius: "3px" }}>
                        <strong>Processing column {(curEvent.args[0] as { column: number, receivedValue: number }).column}</strong>, received value: {(curEvent.args[0] as { receivedValue: number }).receivedValue.toFixed(3)}
                    </div>
                )}
                {curEvent.name === "decode_update_distance" && (
                    <div style={{ padding: "5px", backgroundColor: (curEvent.args[0] as { isBetter: boolean }).isBetter ? "#e8f8e8" : "#f8e8e8", borderRadius: "3px" }}>
                        {(curEvent.args[0] as { isBetter: boolean }).isBetter ? "✓" : "✗"} Node {(curEvent.args[0] as { fromNode: number, toNode: number, edgeValue: number, oldDist: number | string, newDist: number }).fromNode} → Node {(curEvent.args[0] as { toNode: number }).toNode} 
                        (edge: {(curEvent.args[0] as { edgeValue: number }).edgeValue}): 
                        Old dist: {(curEvent.args[0] as { oldDist: number | string }).oldDist}, New dist: {(curEvent.args[0] as { newDist: number }).newDist.toFixed(3)}
                    </div>
                )}
                {curEvent.name === "decode_end_column" && (
                    <div>
                        <div style={{ marginBottom: "5px" }}><strong>Column {(curEvent.args[0] as { column: number }).column} distances:</strong></div>
                        <div style={{ fontSize: "12px", fontFamily: "monospace", padding: "5px", backgroundColor: "#f9f9f9", borderRadius: "3px" }}>
                            {(curEvent.args[0] as { distances: Array<{ node: number, dist: number | string, prev: number, bit: number }> }).distances.map((d: any) => 
                                `Node ${d.node}: dist=${d.dist === Infinity || d.dist === "∞" ? "∞" : d.dist.toFixed(2)}, prev=${d.prev}, bit=${d.bit}`
                            ).join("\n")}
                        </div>
                    </div>
                )}
                {curEvent.name === "decode_backtrack_step" && (
                    <div style={{ padding: "5px", backgroundColor: "#fff8e8", borderRadius: "3px" }}>
                        <div><strong>Backtrack:</strong> Column {(curEvent.args[0] as { column: number, node: number, bit: number, prevNode: number }).column}, Node {(curEvent.args[0] as { node: number }).node}, Bit: {(curEvent.args[0] as { bit: number }).bit}, Prev: {(curEvent.args[0] as { prevNode: number }).prevNode}</div>
                        {"path" in curEvent.args[0] && curEvent.args[0].path && (
                            <div style={{ fontSize: "12px", marginTop: "5px" }}>
                                Path so far: {(curEvent.args[0] as { path: Array<{ column: number, node: number, bit: number }> }).path.map((p: any) => `C${p.column}:N${p.node}:${p.bit}`).join(" → ")}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        
        {/* Messages - Always show when available */}
        <div>
            <h3>Messages</h3>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" }}>
                {curState.originalMessage && (
                    <div>
                        <h4>Original Message</h4>
                        <VisArray array={curState.originalMessage} label="Message" />
                    </div>
                )}
                
                {curState.encoded && (
                    <div>
                        <h4>Encoded</h4>
                        <VisArray array={curState.encoded} label="Encoded" />
                    </div>
                )}
                
                {curState.received && (
                    <div>
                        <h4>Received (with noise)</h4>
                        <VisArray array={curState.received.map(v => v.toFixed(2))} label="Received" />
                    </div>
                )}
                
                {curState.decoded && (
                    <div>
                        <h4>Decoded</h4>
                        <VisArray 
                            array={curState.decoded} 
                            label="Decoded"
                            color={curState.isCorrect ? Color.GREEN : Color.RED}
                        />
                    </div>
                )}
            </div>
        </div>
        
        {/* Result - Always show when available */}
        {curState.isCorrect !== undefined && (
            <div style={{ padding: "10px", backgroundColor: curState.isCorrect ? "#e8f8e8" : "#f8e8e8", borderRadius: "5px", border: `2px solid ${curState.isCorrect ? Color.GREEN : Color.RED}` }}>
                <h3 style={{ color: curState.isCorrect ? Color.GREEN : Color.RED, margin: 0 }}>
                    {curState.isCorrect ? "✓ Decoding Correct" : "✗ Decoding Error"}
                </h3>
                {curState.encoded && curState.decoded && (
                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        Encoded: [{curState.encoded.join(", ")}]<br/>
                        Decoded: [{curState.decoded.join(", ")}]
                    </div>
                )}
            </div>
        )}
    </div>
}
