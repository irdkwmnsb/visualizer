import { useSyncExternalStore } from "react";
import { globalStore } from ".";

export const useVisualizer = () => {
    return useSyncExternalStore(globalStore.subscribe, globalStore.getCurSnapshot);
}