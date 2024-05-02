import { IAlgorithmManifest, initAlgo } from "../../core/manifest"
import { TuringMachineRender } from "./render"
import { TuringMachineStart } from "./start"
import { TuringMachineArguments, TuringMachineEvent, TuringMachineState, turingMachine } from "./turing-machine"

type TuringMachineManifest = IAlgorithmManifest<TuringMachineState, TuringMachineEvent, TuringMachineArguments>;

export const manifest: TuringMachineManifest = {
    algo: turingMachine,
    startComponent: TuringMachineStart,
    renderComponent: TuringMachineRender,
    nameRu: "Машина Тьюринга",
    nameEn: "Turing machine",
    authorEn: "Alzhanov Maksim",
    authorRu: "Альжанов Максим",
    descriptionRu: "Машина Тьюринга с одной бесконечной лентой и бесконечным количеством состояний",
    descriptionEn: "Turing machine with a single infinite tape and infinite number of states"
}


export const { bind, here, store } = initAlgo<TuringMachineState, TuringMachineEvent, TuringMachineArguments, TuringMachineManifest>(manifest)

