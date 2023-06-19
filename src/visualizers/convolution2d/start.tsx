import { useState } from "react"
import { Convolution2DArguments } from "./convolution2d"
import { PaddingType, ArrayMatrix } from "./matrix"

type Props = {
    doStart: (args: Convolution2DArguments, noStop: boolean) => void
}

export const Convolution2DStarter = ({ doStart }: Props) => {
    const options = Object.values(PaddingType);
    const [selectedType, setSelectedType] = useState(PaddingType.Edge);
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
        selectedType,
    ]
    console.log(args[4]);
    return <div>
        <select 
            value={selectedType}
            onChange={(op) => setSelectedType(op.target.value as PaddingType)}
        >
            {options.map((op) => <option value={op} key={op}>
                {op}
            </option>)}
        </select>
        <button onClick={() => doStart(args, false)}>Start</button>
        <button onClick={() => doStart(args, true)}>Run Full</button>
    </div>;
}
