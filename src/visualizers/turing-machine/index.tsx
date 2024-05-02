import { IAlgorithmManifest, initAlgo } from "../../core/manifest"
import { TuringMachineRender } from "./render"
import { TuringMachineStart } from "./start"
import { TuringMachineArguments, TuringMachineEvent, TuringMachineState, turingMachine } from "./turing-machine"

type TuringMachineManifest = IAlgorithmManifest<TuringMachineState, TuringMachineEvent, TuringMachineArguments>;

export const manifest: TuringMachineManifest = {
    algo: turingMachine,
    startComponent: TuringMachineStart,
    renderComponent: TuringMachineRender,
}


export const { bind, here, store } = initAlgo<TuringMachineState, TuringMachineEvent, TuringMachineArguments, TuringMachineManifest>(manifest)

