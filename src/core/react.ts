import { useSyncExternalStore } from "react"
import { RuntimeStore } from "./store"


export const useVisualizer = <Store extends RuntimeStore>(store: Store) => {
    return useSyncExternalStore(store.subscribe, store.getCurSnapshot)
}
