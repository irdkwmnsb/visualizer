/* @refresh reload */
import { useEffect, useState } from "react"
import { RuntimeStore } from "./core/store"
import { IAlgorithmManifest } from "./core/manifest"
import { useVisualizer } from "./core/react"
import "@fontsource-variable/arimo"
import "./App.module.scss"

type AppProps = {
    manifest: IAlgorithmManifest,
    store: RuntimeStore
}

const App = ({ manifest, store }: AppProps) => {
    const vis = useVisualizer(store)
    const {curState, curEvent, events, currentStep, start, next} = vis
    const [eventOverride, setEventOverride] = useState<number | undefined>(undefined)
    const curEventOverride = eventOverride !== undefined && events !== undefined ? events[eventOverride] : curEvent
    const curStateOverride = eventOverride !== undefined && events !== undefined ? events[eventOverride].state : curState
    const doNext = () => {
        if(currentStep === undefined) {
            return
        }
        if (eventOverride !== undefined && events !== undefined && eventOverride < events.length - 1) {
            setEventOverride(eventOverride + 1)
        } else {
            next()
            setEventOverride(undefined)
        }
    }
    const doPrev = () => {
        if(currentStep === undefined || events === undefined || !vis.config.storeEvents) {
            return
        }
        if(eventOverride === undefined) {
            setEventOverride(currentStep - 2)
        } else if (eventOverride > 0) {
            setEventOverride(eventOverride - 1)
        }
    }
    useEffect(() => {
        const keyListener = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault()
                doNext()
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault()
                doPrev()
            }
        }
        window.addEventListener("keydown", keyListener)
        return () => {
            window.removeEventListener("keydown", keyListener)
        }
    }, [eventOverride, currentStep])

    return <div>
        <h1>Visualizer</h1>
        <h2>Current Step: {currentStep}</h2>
        <button onClick={doNext}>Next</button>
        <button disabled={!vis.config.storeEvents} onClick={doPrev}>Prev</button>
        <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(undefined)}>Reset</button>
        <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(0)}>Beginning</button>
        <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(events!.length - 1)}>End</button>
        <small>Use arrow keys to navigate</small>
        <manifest.startComponent doStart={start}/>
        {curStateOverride && curEventOverride && <manifest.renderComponent curState={curStateOverride} curEvent={curEventOverride}/>}
        <br/>
        <br/>
        <br/>
        <br/>
        <div>
            {events && events.map((x, i) => {
                return <div key={i}>
                    {i === eventOverride ? "OVERRIDE" : ""}
                    {i === currentStep! - 1 ? "CUR" : ""}
                    {JSON.stringify(x)}
                    <button onClick={() => setEventOverride(i)}>Jump</button>
                </div>
            })}
        </div>
    </div>
}

export default App
