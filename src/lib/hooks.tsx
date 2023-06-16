import { useSyncExternalStore } from "react";
import { globalStore } from "../visualizers/bubble-sort";

export const useVisualizer = () => {
    return useSyncExternalStore(globalStore.subscribe, globalStore.getCurSnapshot);
}