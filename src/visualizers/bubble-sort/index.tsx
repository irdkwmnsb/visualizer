import { AlgorithmManifest } from "../../lib/manifest"
import { RuntimeStore } from "../../lib/store"
import { BubbleSortArguments, BubbleSortEvent, BubbleSortState, bubbleSort } from "./bubble-sort"
import { BubbleSortRender } from "./render"
import { BubbleSortStarter } from "./start"

export const manifest: AlgorithmManifest<BubbleSortState, BubbleSortEvent, BubbleSortArguments> = {
    algo: bubbleSort,
    startComponent: BubbleSortStarter,
    renderComponent: BubbleSortRender
}

export const globalStore = new RuntimeStore<BubbleSortState, BubbleSortEvent, BubbleSortArguments>(bubbleSort)

export const bind = (name: keyof BubbleSortState, value: BubbleSortState[keyof BubbleSortState]) => {
    globalStore.bind(name, value)
}

export const here = async (name: BubbleSortEvent["name"], ...args: BubbleSortEvent["args"]): Promise<void> => {
    return globalStore.here(name, ...args)
}