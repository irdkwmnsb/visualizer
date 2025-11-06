import { IAlgorithmManifest, initAlgo } from "../../core/manifest"
import { ViterbiArguments, ViterbiEvent, ViterbiState, viterbi } from "./viterbi"
import { ViterbiRender } from "./render"
import { ViterbiStarter } from "./start"

type ViterbiManifest = IAlgorithmManifest<
    ViterbiState, 
    ViterbiEvent, 
    ViterbiArguments
>

export const manifest: ViterbiManifest = {
    algo: viterbi,
    startComponent: ViterbiStarter,
    renderComponent: ViterbiRender,
    nameEn: "Viterbi Algorithm",
    descriptionEn: "Viterbi decoding algorithm for linear block codes",
    authorEn: "Alzhanov Maksim",
    nameRu: "Алгоритм Витерби",
    descriptionRu: "Алгоритм декодирования Витерби для линейных блоковых кодов",
    authorRu: "Альжанов Максим"
}

export const { bind, here, update, store } = initAlgo<
    ViterbiState, 
    ViterbiEvent, 
    ViterbiArguments, 
    ViterbiManifest
>(manifest)

