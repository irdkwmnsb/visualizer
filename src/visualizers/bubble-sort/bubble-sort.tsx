import { bind, here } from "../../lib";

export const bubbleSort = async (array: number[]) => {
    bind("array", array);
    let sorted = false;
    while (!sorted) {
        sorted = true;
        for (let i = 0; i < array.length - 1; i++) {
            await here("compare", i, i + 1);
            if (array[i] > array[i + 1]) {
                sorted = false;
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                await here("swap", i, i + 1);
            }
        }
    }
}

export type BubbleSortState = {
    array: number[];
}

export type BubbleSortEvent = {
    name: "compare" | "swap";
    args: [number, number];
}

export type BubbleSortArguments = [number[]];