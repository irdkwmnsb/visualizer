import styles from "./start.module.scss"
import { StartProps } from "../../core/manifest"
import { Tape } from "./tape"
import { TuringMachineArguments } from "./turing-machine"
import { useImmer } from "use-immer"
import Editor from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { useCallback, useRef } from "react"
import { current } from "immer"

const VIEWPORT = [-10, 10]


export const TuringMachineStart = ({ doStart }: StartProps<TuringMachineArguments>) => {
    const [tape, updateTape] = useImmer(new Tape())
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
    const els = []
    for (let i = VIEWPORT[0]; i <= VIEWPORT[1]; i++) {
        els.push(
            <div className={styles.tapeCell} key={i}>
                <label htmlFor={"inputTape" + i}>{i}</label>
                <input 
                    id={"inputTape"+i}
                    value={tape.get(i)}
                    onChange={(ev) => {
                        ev.preventDefault()
                        updateTape((draft) => {
                            console.log(current(draft))
                            draft.set(i, ev.target.value)
                            console.log(current(draft))
                        })
                    }}/>
            </div>
        )
    }
    const onStart = useCallback(() => {
        console.log("tape: ", tape)
        doStart([editorRef.current.getValue(), tape, 10_000], false)
    }, [tape])
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
