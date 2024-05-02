import _ from "lodash"
import { RenderProps } from "../../core/manifest"
import { TuringMachineEvent, TuringMachineState } from "./turing-machine"
import { TapeRender } from "./tape-render"

export const TuringMachineRender = ({ curState, curEvent }: RenderProps<TuringMachineState, TuringMachineEvent>) => {
    console.log("Rendering", curState, curEvent)
    if (curEvent.name === "error") {
        return <div>
            Error while running: {curEvent.error + ""}
        </div>
    }
    return <div>
        {curState.machineState.status}
        <br/>
        {curState.machineState.description}
        <br/>
        <TapeRender tape={curState.tape} headPosition={curState.machineState.curPosition}/>
        Selected rule:
        {
            curEvent.name == "fetch" &&
            (curEvent.args[0] === null ? "Not found." : curEvent.args[0].fullString)
        }
    </div>
}