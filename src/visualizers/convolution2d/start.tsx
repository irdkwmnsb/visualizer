import { Convolution2DArguments } from "./convolution2d"
import { PaddingType, ArrayMatrix } from "./matrix"

type Props = {
    doStart: (args: Convolution2DArguments, noStop: boolean) => void
}

const args: Convolution2DArguments = [
    new ArrayMatrix([
        [5, 4, 3, 2, 1],
        [4, 3, 2, 1, 0],
        [3, 2, 1, 0, 1],
        [2, 1, 0, 1, 2],
        [1, 0, 1, 2, 3],
    ]),
    new ArrayMatrix([
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
    ]),
    2,
    3,
    PaddingType.Edge,
]

export const Convolution2DStarter = ({ doStart}: Props) => {
    return <div>
        <button onClick={() => doStart(args, false)}>Start</button>
        <button onClick={() => doStart(args, true)}>Run Full</button>
    </div>;
}
