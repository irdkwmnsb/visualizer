import { DBScanArguments } from "./dbscan"

type Props = {
    doStart: (args: DBScanArguments, noStop: boolean) => void
}

const args: DBScanArguments = [
    [[0, 0], [1, 0], [0, 1], [1, 1], [10, 3], [5, 5], [5, 6], [6, 5], [6, 6]],
    2,
    3,
];

export const DBScanStarter = ({ doStart }: Props) => {
    return <div>
        <button onClick={() => doStart(args, false)}>Start</button>
        <button onClick={() => doStart(args, true)}>Run Full</button>
    </div>;
}
