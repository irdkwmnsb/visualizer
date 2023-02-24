import { useSyncExternalStore } from "React";
import { globalStore } from ".";

export const useVisualizer = () => {
    return useSyncExternalStore(globalStore.subscribe, globalStore.getCurSnapshot);
}