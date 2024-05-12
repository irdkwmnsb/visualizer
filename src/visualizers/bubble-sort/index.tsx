import { IAlgorithmManifest, initAlgo } from "../../core/manifest"
import { BubbleSortArguments, BubbleSortEvent, BubbleSortState, bubbleSort } from "./bubble-sort"
import { BubbleSortRender } from "./render"
import { BubbleSortStarter } from "./start"

type BubbleSortManifest = IAlgorithmManifest<
    BubbleSortState, 
    BubbleSortEvent, 
    BubbleSortArguments
>

export const manifest: BubbleSortManifest = {
    algo: bubbleSort,
    startComponent: BubbleSortStarter,
    renderComponent: BubbleSortRender,
    nameEn: "Bubble sort",
    descriptionEn: "Bubble sort algorithm",
    authorEn: "Alzhanov Maxim",
    nameRu: "Пузырьковая сортировка",
    descriptionRu: "Алгоритм пузырьковой сортировки",
    authorRu: "Альжанов Максим"
}

export const { bind, here, update, store } = initAlgo<
    BubbleSortState, 
    BubbleSortEvent, 
    BubbleSortArguments, 
    BubbleSortManifest
>(manifest)

// Probably want to use some sort of https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/default-exports.md to enforce store export

// todo: move to codegen
// todo: work on types so we don't have to specify them here.

// This doesn't compile in bubble-sort.tsx
// export const { bind, here, store } = initAlgo(manifest)
