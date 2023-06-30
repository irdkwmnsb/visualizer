import { StartProps } from "../../lib/manifest"
import { BubbleSortArguments } from "./bubble-sort"

// type Props = {
//     doStart: (args: BubbleSortArguments, noStop: boolean) => void
// }

export const BubbleSortStarter = ({ doStart }: StartProps<BubbleSortArguments>) => {
    return <div>
        <button onClick={() => doStart([[5, 4, 3, 2, 1]], false)}>Start</button>
        <button onClick={() => doStart([[5, 4, 3, 2, 1]], true)}>Run Full</button>
    </div>
}
