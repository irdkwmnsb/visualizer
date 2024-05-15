import { useCallback, useState } from "react"
import { StartProps } from "../../core/manifest"
import { KMeansArguments } from "./k-means"
import _ from "lodash"
import { makeBlobs } from "../../data/points"

export const BubbleSortStarter = ({ doStart }: StartProps<KMeansArguments>) => {
    const [k, setK] = useState(3)
    const [randState, setRandState] = useState("42")
    
    const start = useCallback((fullRun: boolean) => {
        const [X, _] = makeBlobs(500, k, undefined, undefined, randState)
        doStart([k, X], fullRun)
    }, [k])

    return <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        padding: "5px"
    }}>
        <label>
            Cluster K:
            <input type="number" name="k" value={k} onChange={(ev) => setK(parseInt(ev.target.value))}/>
        </label>
        <label>
            Random seed:
            <input name="seed" value={randState} onChange={(ev) => setRandState(ev.target.value)}/>
        </label>
        <button onClick={() => start(false)}>Start</button>
        <button onClick={() => start(true)}>Run Full</button>
    </div>
}
