import styles from "./start.module.scss"
import { StartProps } from "../../core/manifest"
import { Tape } from "./tape"
import { TuringMachineArguments } from "./turing-machine"
import { useImmer } from "use-immer"
import Editor from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { useCallback, useEffect, useRef } from "react"

const VIEWPORT = [-10, 10]


export const TuringMachineStart = ({ doStart }: StartProps<TuringMachineArguments>) => {
    const [tape, updateTape] = useImmer(new Tape())
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const els = []
    for (let i = VIEWPORT[0]; i <= VIEWPORT[1]; i++) {
        els.push(
            <div className={styles.tapeCell} key={i}>
                <label htmlFor={"inputTape" + i}>{i}</label>
                <input 
                    id={"inputTape"+i}
                    value={tape.get(i)}
                    onFocus={(ev) => {
                        ev.target.select()
                    }}
                    autoComplete="off"
                    onChange={(ev) => {
                        ev.preventDefault()
                        updateTape((draft) => {
                            draft.set(i, ev.target.value)
                        })
                    }}/>
            </div>
        )
    }
    const onStart = useCallback(() => {
        if (editorRef.current !== null) {
            doStart([editorRef.current.getValue(), tape, 10_000], false)
        }
    }, [tape])
    useEffect(() => { // https://github.com/Microsoft/monaco-editor/issues/28
        const resize = () => {
            if (editorRef.current !== null) {
                editorRef.current.layout()
            } 
        }
        window.addEventListener("resize", resize)
        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [])
    return <div className={styles.startContainer}>
        <div className={styles.tapeContainer}>
            {els}
        </div>
        <Editor height="300px" onMount={(editor) => editorRef.current = editor} defaultValue="start: s
accept: ac
reject: rj
s _ -> ac _ ^
s 0 -> n _ >
n 0 -> s _ >
n _ -> rj _ >"/>
        <button onClick={onStart}>Start</button>
    </div>
}
