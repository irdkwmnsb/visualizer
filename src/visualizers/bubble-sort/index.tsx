import { IAlgorithmManifest, initAlgo } from "../../lib/manifest"
import { BubbleSortArguments, BubbleSortEvent, BubbleSortState, bubbleSort } from "./bubble-sort"
import { BubbleSortRender } from "./render"
import { BubbleSortStarter } from "./start"

type BubbleSortManifest = IAlgorithmManifest<BubbleSortState, BubbleSortEvent, BubbleSortArguments>;

export const manifest: BubbleSortManifest = {
    algo: bubbleSort,
    startComponent: BubbleSortStarter,
    renderComponent: BubbleSortRender,
}


// todo: move to codegen
// todo: work on types so we don't have to specify them here.
export const { bind, here, store } = initAlgo<BubbleSortState, BubbleSortEvent, BubbleSortArguments, BubbleSortManifest>(manifest)

// This doesn't compile in bubble-sort.tsx
// export const { bind, here, store } = initAlgo(manifest);
