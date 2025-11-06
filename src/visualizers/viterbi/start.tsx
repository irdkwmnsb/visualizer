import { useCallback, useState } from "react"
import { StartProps } from "../../core/manifest"
import { ViterbiArguments } from "./viterbi"

export const ViterbiStarter = ({ doStart }: StartProps<ViterbiArguments>) => {
    const [n, setN] = useState(6) // codeword length
    const [k, setK] = useState(3) // message length
    const [noiseLevel, setNoiseLevel] = useState(0) // SNR in dB
    const [matrixInput, setMatrixInput] = useState("1 0 1 1 0 0\n0 1 0 1 1 0\n0 0 1 0 1 1")
    const [messageInput, setMessageInput] = useState("1 0 1")
    
    const parseMatrix = (input: string, rows: number, cols: number): number[][] | null => {
        const lines = input.trim().split("\n")
        if (lines.length !== rows) return null
        
        const matrix: number[][] = []
        for (const line of lines) {
            const values = line.trim().split(/\s+/).map(v => parseInt(v))
            if (values.length !== cols || values.some(v => isNaN(v) || (v !== 0 && v !== 1))) {
                return null
            }
            matrix.push(values)
        }
        return matrix
    }
    
    const parseMessage = (input: string, length: number): number[] | null => {
        const values = input.trim().split(/\s+/).map(v => parseInt(v))
        if (values.length !== length || values.some(v => isNaN(v) || (v !== 0 && v !== 1))) {
            return null
        }
        return values
    }
    
    const start = useCallback((fullRun: boolean) => {
        const generatorMatrix = parseMatrix(matrixInput, k, n)
        const message = parseMessage(messageInput, k)
        
        if (!generatorMatrix) {
            alert("Invalid generator matrix. Please enter k×n binary matrix (0s and 1s)")
            return
        }
        
        if (!message) {
            alert("Invalid message. Please enter k binary values (0s and 1s)")
            return
        }
        
        doStart([generatorMatrix, message, noiseLevel], fullRun)
    }, [n, k, noiseLevel, matrixInput, messageInput, doStart])
    
    const generateRandomMatrix = useCallback(() => {
        const matrix: number[][] = []
        for (let i = 0; i < k; i++) {
            const row: number[] = []
            for (let j = 0; j < n; j++) {
                row.push(Math.random() < 0.5 ? 0 : 1)
            }
            matrix.push(row)
        }
        setMatrixInput(matrix.map(row => row.join(" ")).join("\n"))
    }, [k, n])
    
    const generateRandomMessage = useCallback(() => {
        const message = Array.from({ length: k }, () => Math.random() < 0.5 ? 0 : 1)
        setMessageInput(message.join(" "))
    }, [k])
    
    return <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px"
    }}>
        <div>
            <label>
                Codeword length (n): 
                <input 
                    type="number" 
                    value={n} 
                    onChange={(ev) => setN(parseInt(ev.target.value) || 6)}
                    min={2}
                    max={20}
                />
            </label>
        </div>
        
        <div>
            <label>
                Message length (k): 
                <input 
                    type="number" 
                    value={k} 
                    onChange={(ev) => setK(parseInt(ev.target.value) || 3)}
                    min={1}
                    max={n}
                />
            </label>
        </div>
        
        <div>
            <label>
                Generator Matrix (k×n, one row per line, space-separated):
                <button onClick={generateRandomMatrix} style={{ marginLeft: "10px" }}>
                    Generate Random
                </button>
            </label>
            <textarea
                value={matrixInput}
                onChange={(ev) => setMatrixInput(ev.target.value)}
                rows={k}
                cols={n * 2 + 5}
                style={{ fontFamily: "monospace", width: "100%" }}
            />
        </div>
        
        <div>
            <label>
                Message (k bits, space-separated):
                <button onClick={generateRandomMessage} style={{ marginLeft: "10px" }}>
                    Generate Random
                </button>
            </label>
            <input
                type="text"
                value={messageInput}
                onChange={(ev) => setMessageInput(ev.target.value)}
                style={{ fontFamily: "monospace", width: "100%" }}
            />
        </div>
        
        <div>
            <label>
                Noise Level (SNR in dB, 0 = no noise): 
                <input 
                    type="number" 
                    value={noiseLevel} 
                    onChange={(ev) => setNoiseLevel(parseFloat(ev.target.value) || 0)}
                    min={0}
                    max={20}
                    step={0.5}
                />
            </label>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => start(false)}>Start</button>
            <button onClick={() => start(true)}>Run Full</button>
        </div>
    </div>
}

