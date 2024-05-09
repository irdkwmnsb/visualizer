import styles from "./start.module.scss"
import { StartProps } from "../../core/manifest"
import { Tape } from "./tape"
import { TuringMachineArguments } from "./turing-machine"
import { useImmer } from "use-immer"
import * as monaco from "monaco-editor"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import { Editor, loader } from "@monaco-editor/react" // TODO: https://www.npmjs.com/package/vite-plugin-monaco-editor
import { useCallback, useEffect, useRef, useState } from "react"

const VIEWPORT = [-10, 10]

self.MonacoEnvironment = {
    getWorker() {
        return new editorWorker()
    }
}

loader.config({ monaco })

monaco.languages.register({id: "turing"})
monaco.languages.setMonarchTokensProvider("turing", {
    ignoreCase: false,
    defaultToken: "invalid",
    tokenizer: {
        root: [
            [/(start|accept|reject):\s.*/, "comment"],
            [/./, {token: "@rematch", next: "program"}]
        ],
        program: [
            [/.*/, "text"] 
            // Turns out monarch can't really parse state names and highlight them accordingly. 
            // I guess it's better to make my own language server which i'm not in the mood at the moment.
        ]
    }
})

export const TuringMachineStart = ({ doStart }: StartProps<TuringMachineArguments>) => {
    const [tape, updateTape] = useImmer(new Tape())
    const [centerCell, setCenterCell] = useState(0)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const els = []
    for (let i = centerCell + VIEWPORT[0]; i <= centerCell + VIEWPORT[1]; i++) {
        els.push(
            <div className={styles.tapeCell} key={i}>
                <label htmlFor={"inputTape" + i}>{i}</label>
                <input 
                    id={"inputTape"+i}
                    value={tape.get(i)}
                    onFocus={(ev) => {
                        setCenterCell(i)
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
    const onStart = useCallback((full: boolean) => () => {
        if (editorRef.current !== null) {
            doStart([editorRef.current.getValue(), tape, 10_000], full)
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
        {centerCell}
        <div className={styles.tapeContainer}>
            {els}
        </div>
        <Editor 
            height="300px" 
            onMount={(editor) => {
                return editorRef.current = editor
            }} 
            language="turing"
            defaultValue="start: s
accept: ac
reject: rj
s _ -> ac _ ^
s 0 -> n _ >
n 0 -> s _ >
n _ -> rj _ >"/>
        <button onClick={onStart}>Start</button>
        <button onClick={onStart(true)}>Full run</button>
    </div>
}
