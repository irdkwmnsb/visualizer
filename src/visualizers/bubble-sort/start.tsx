import { useCallback, useState } from "react"
import { StartProps } from "../../core/manifest"
import { BubbleSortArguments } from "./bubble-sort"
import _ from "lodash"

export const BubbleSortStarter = ({ doStart }: StartProps<BubbleSortArguments>) => {
    const [n, setN] = useState(5)
    const start = useCallback((fullRun: boolean) => {
        const array = _.shuffle(_.range(1, n + 1))
        doStart([array], fullRun)
    }, [n])
    return <div>
        <label>
            Array size: 
            <input type="number" name="n" value={n} onChange={(ev) => setN(parseInt(ev.target.value))}/>
        </label>
        <button onClick={() => start(false)}>Start</button>
        <button onClick={() => start(true)}>Run Full</button>
    </div>
}
