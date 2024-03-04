import { RenderProps } from "../../core/manifest"
import { TuringMachineEvent, TuringMachineState } from "./turing-machine"

export const TuringMachineRender = ({ curState, curEvent }: RenderProps<TuringMachineState, TuringMachineEvent>) => {
    console.log("Rendering", curState, curEvent)
    return <div>
        Renderer:
        <div>
            {curState && JSON.stringify(curState)}
        </div>
        <div>
            {curState && JSON.stringify(curEvent)}
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
    </div>
}