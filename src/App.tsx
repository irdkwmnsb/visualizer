/* @refresh reload */
import { useEffect, useState } from "react"
import { RuntimeStore } from "./core/store"
import { IAlgorithmManifest } from "./core/manifest"
import { useVisualizer } from "./core/react"
import "@fontsource-variable/arimo"
import styles from "./App.module.scss"
import classNames from "classnames"

type AppProps = {
    manifest: IAlgorithmManifest,
    store: RuntimeStore
}

enum Tab {
    Starter, Render
}

const App = ({ manifest, store }: AppProps) => {
    const vis = useVisualizer(store)
    const {curState, curEvent, events, currentStep, start, next} = vis
    const [eventOverride, setEventOverride] = useState<number | undefined>(undefined)
    const curEventOverride = eventOverride !== undefined && events !== undefined ? events[eventOverride] : curEvent
    const curStateOverride = eventOverride !== undefined && events !== undefined ? events[eventOverride].state : curState
    const isRunning = curEventOverride !== undefined && curStateOverride !== undefined
    const [curTab, setCurTab] = useState<Tab>(Tab.Starter)
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
    const doStart: typeof start = (...args) => {
        setCurTab(Tab.Render)
        start(...args)
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

    return <div className={styles.app}>
        <div className={styles.header}>
            <h1>{manifest.nameRu}</h1>
            <article>{manifest.descriptionRu}</article>
            <section className={styles.tabSwitcher}>
                <button onClick={() => setCurTab(Tab.Starter)}>Starter</button>
                <button onClick={() => setCurTab(Tab.Render)} disabled={!isRunning}>Render</button>
            </section>
        </div>
        <section className={styles.main}>
            <div className={classNames(styles.tab, styles.tabStarter, {
                [styles.enabled]: curTab === Tab.Starter
            })}>
                <manifest.startComponent doStart={doStart}/>
            </div>
            <div className={classNames(styles.tab, styles.tabRender, {
                [styles.enabled]: curTab === Tab.Render
            })}>
                {curStateOverride && curEventOverride && <manifest.renderComponent curState={curStateOverride} curEvent={curEventOverride}/>}
            </div>
        </section>
        <div className={styles.sidebar}>
            <section className={styles.player}>
                <div>Current Step: {currentStep}</div>
                <button onClick={doNext}>Next</button>
                <button disabled={!vis.config.storeEvents} onClick={doPrev}>Prev</button>
                <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(undefined)}>Reset</button>
                <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(0)}>Beginning</button>
                <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(events!.length - 1)}>End</button>
                <small>Use arrow keys to navigate</small>
            </section>
            <section className={styles.events}>
                {events && events.map((x, i) => {
                    return <div key={i}>
                        {i === eventOverride ? "OVERRIDE" : ""}
                        {i === currentStep! - 1 ? "CUR" : ""}
                        {JSON.stringify(x)}
                        <button onClick={() => setEventOverride(i)}>Jump</button>
                    </div>
                })}
            </section>
        </div>
    </div>
}

export default App
