import { useSyncExternalStore } from "react";
import { globalStore } from "../visualizers/dbscan";

export const useVisualizer = () => {
    return useSyncExternalStore(globalStore.subscribe, globalStore.getCurSnapshot);
}