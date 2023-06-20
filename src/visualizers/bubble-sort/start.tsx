import { ParameterComponent, Num, Arr } from "../../lib/params"
import { BubbleSortArguments } from "./bubble-sort"

// type Props = {
//     doStart: (args: BubbleSortArguments, noStop: boolean) => void
// }

export const BubbleSortStarter = ({ doStart }) => {
    
    const propArr = {
        label: "массив",
        value: new Arr<number, Num>(new Num())
    }

    const components = [<ParameterComponent<number[]> {...propArr} />].map((v) => <li>{v}</li>);

    return <div>
        <ul>{components}</ul>
        <button onClick={() => doStart([propArr.value.value], false)}>Start</button>
        <button onClick={() => doStart([propArr.value.value], true)}>Run Full</button>
    </div>;
}
