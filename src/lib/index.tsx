import { bubbleSort } from "../visualizers/bubble-sort/bubble-sort";
import { RuntimeStore } from "./store"

export const globalStore = new RuntimeStore(bubbleSort);

export const bind = (name: string, value: any) => {
    console.log("Binding", name, value);
    globalStore.bind(name, value);
}

export const here = async (name: string, ...args: any[]): Promise<void> => {
    console.log("Here", name, args);
    return globalStore.here(name, ...args);
}