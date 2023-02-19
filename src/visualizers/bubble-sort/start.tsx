import { BubbleSortArguments } from "./bubble-sort"

type Props = {
    doStart: (...BubbleSortArguments) => void
}

export const BubbleSortStarter = ({ doStart }: Props) => {
    return <div>
        <button onClick={() => doStart([5, 4, 3, 2, 1])}>Start</button>
    </div>;
}
