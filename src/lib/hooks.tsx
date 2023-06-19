import { useSyncExternalStore } from "react";
import { globalStore } from "../visualizers/convolution2d";

export const useVisualizer = () => {
    return useSyncExternalStore(globalStore.subscribe, globalStore.getCurSnapshot);
}