import _ from "lodash"
import { RenderProps } from "../../core/manifest"
import { TuringMachineEvent, TuringMachineState } from "./turing-machine"

export const TuringMachineRender = ({ curState, curEvent }: RenderProps<TuringMachineState, TuringMachineEvent>) => {
    console.log("Rendering", curState, curEvent)
    return <div>
        {curState.machineState.status}
        <br/>
        {curState.machineState.description}
        <br/>
        Tape:
        <code>
            {_.range(-10, 10).map((index) => (
                curState.tape.get(index)
            ))}
        </code>
        Selected rule:
        {
            curEvent.name == "fetch" &&
            JSON.stringify(curEvent.args[0])
        }
    </div>
}