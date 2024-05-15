/* @refresh reload */
import { useEffect, useRef, useState } from "react"
import { RuntimeStore } from "./core/store"
import { IAlgorithmManifest } from "./core/manifest"
import { useVisualizer } from "./core/react"
import "@fontsource-variable/arimo"
import styles from "./App.module.scss"
import classNames from "classnames"
import { VList, VListHandle } from "virtua"

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
        if(currentStep === undefined || events === undefined || !vis.config.storeEvents || currentStep === 0 || eventOverride === 0) {
            return
        }
        if(eventOverride === undefined) {
            setEventOverride(currentStep - 2)
        } else if (eventOverride > 0) {
            setEventOverride(eventOverride - 1)
        }
    }
    const eventsHandle = useRef<VListHandle>(null)
    const doStart: typeof start = (...args) => {
        setCurTab(Tab.Render)
        setEventOverride(undefined)
        start(...args)
    }
    useEffect(() => {
        if(eventsHandle.current !== null) {
            eventsHandle.current.scrollToIndex(eventOverride ?? currentStep ?? 0, {align: "nearest"})
        }
    }, [eventOverride, currentStep])
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
            <a onClick={(_) => history.back()}>&larr; Go back</a>
            <h1>{manifest.nameEn}</h1>
            <article>{manifest.descriptionEn}</article>
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
                {curStateOverride && curEventOverride && 
                    ("customErrorHandling" in manifest && manifest.customErrorHandling === true ? 
                        <manifest.renderComponent curState={curStateOverride} curEvent={curEventOverride}/> :
                        curEventOverride.name === "error" ? 
                            <pre>
                                {curEventOverride.error.stack}
                            </pre>:
                            <manifest.renderComponent curState={curStateOverride} curEvent={curEventOverride}/>
                    )
                }
            </div>
        </section>
        <div className={styles.sidebar}>
            <section className={styles.player}>
                <div>
                    {currentStep === undefined ? 
                        "Not started" : 
                        "Step " + (eventOverride === undefined ? currentStep : eventOverride + 1)
                    }
                </div>
                <div className={styles.controls}>
                    <button onClick={doNext}>Next</button>
                    <button disabled={!vis.config.storeEvents} onClick={doPrev}>Prev</button>
                    <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(0)}>Beginning</button>
                    <button disabled={!vis.config.storeEvents} onClick={() => setEventOverride(events!.length - 1)}>End</button>
                </div>
                <small>Use arrow keys to navigate</small>
            </section>
            <section className={styles.events}>
                Events:
                <div className={styles.eventsContainer}>
                    {events ? 
                        <VList ref={eventsHandle}>
                            {events.map((event, index) => {
                                const isSelected = index === eventOverride || (eventOverride === undefined && index === currentStep! - 1)
                                return <div key={index} className={classNames(styles.event, {
                                    [styles.selected]: isSelected
                                })} onClick={() => setEventOverride(index)}>
                                    <button onClick={() => setEventOverride(index)} disabled={isSelected}>&rarr;</button>
                                    {index + 1} {event.name}
                                </div>
                            })}
                        </VList>
                        : "Nothing yet.."
                    }
                </div>
            </section>
        </div>
    </div>
}

export default App
