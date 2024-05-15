import _ from "lodash"
import { SafeRenderProps } from "../../core/manifest"
import { TuringMachineEvent, TuringMachineState } from "./turing-machine"
import { TapeRender } from "./tape-render"
import styles from "./render.module.scss"
import cytoscape from "cytoscape"
import { useEffect, useRef } from "react"


export const TuringMachineRender = ({ curState, curEvent }: SafeRenderProps<TuringMachineState, TuringMachineEvent>) => {
    const program = curState.program
    const cy = useRef<cytoscape.Core | null>(null)
    const graphRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (graphRef.current === null) {
            return
        }
        cy.current = cytoscape({
            container: graphRef.current,
            elements: [],
            style: [
                {
                    selector: "edge",
                    style: {
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "label": "data(fullstring)",
                    }
                },
                {
                    selector: "node",
                    style: {
                        "content": "data(id)",
                        "text-valign": "center",
                        "text-halign": "center"
                    }
                },
                {
                    selector: ".active",
                    style: {
                        "border-width": 3,
                        "border-color": "black",
                        "border-style": "solid",
                    }
                },
                {
                    selector: "edge.selected",
                    style: {
                        "line-color": "black",
                        "target-arrow-color": "black"
                    }
                },
                {
                    selector: ".start",
                    style: {
                        "background-color": "yellow"
                    }
                },
                {
                    selector: ".accept",
                    style: {
                        "background-color": "green"
                    }
                },
                {
                    selector: ".reject",
                    style: {
                        "background-color": "red"
                    }
                }
            ]
        })
        return () => { cy.current?.destroy() }
    }, [])
    useEffect(() => {
        const newActive = cy.current?.$("#" + curState.machineState.state)
        newActive?.addClass("active")
        return () => {
            const oldActive = cy.current?.$(".active")
            oldActive?.removeClass("active")
        }
    }, [curState])
    useEffect(() => {
        console.log(curEvent)
        if (curEvent.name === "fetch" && curEvent.args[0] !== null) {
            const edge = cy.current?.$("#" + curEvent.args[0].lineNumber)
            console.log("edge", edge)
            edge?.addClass("selected")
        }
        return () => {
            cy.current?.$("edge.selected").removeClass("selected")
        }
    }, [curEvent])
    useEffect(() => {
        const {start, accept, reject, rules} = program
        const states = new Set([...rules.flatMap((rule) => [rule.curState, rule.newState]), start, accept, reject])
        cy.current?.add([...states].map((state) => ({
            data: {
                id: state
            }
        })))
        cy.current?.$("#" + start).addClass("start")
        cy.current?.$("#" + accept).addClass("accept")
        cy.current?.$("#" + reject).addClass("reject")
        for (const rule of rules) {
            cy.current?.add({
                data: {
                    id: rule.lineNumber + "",
                    source: rule.curState,
                    target: rule.newState,
                    fullstring: rule.fullString
                }
            })
        }
        const layout = cy.current?.layout({
            name: "cose",
            idealEdgeLength: () => 4
        })
        layout?.run()
        return () => {
            console.log("removing")
            cy.current?.remove("")
            console.log(cy.current?.elements())
        }
    }, [JSON.stringify(program)])
    if (curEvent.name === "error") {
        return <div>
            Error while running: {curEvent.error + ""}
        </div>
    }
    return <div>
        {curState.machineState.description}
        <br/>
        <TapeRender tape={curState.tape} headPosition={curState.machineState.curPosition}/>
        <br/>
        Selected rule:
        {
            curEvent.name == "fetch" &&
            (curEvent.args[0] === null ? "Not found." : curEvent.args[0].fullString)
        }
        <div className={styles.graphCanvas} ref={graphRef}></div>
    </div>
}
