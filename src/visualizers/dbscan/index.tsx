import { AlgorithmManifest } from "../../lib/manifest";
import { RuntimeStore } from "../../lib/store";
import { DBScanArguments, DBScanEvent, DBScanState, dbscan } from "./dbscan";
import { DBScanRender } from "./render";
import { DBScanStarter } from "./start";

export const manifest: AlgorithmManifest<DBScanState, DBScanEvent, DBScanArguments> = {
    algo: dbscan,
    startComponent: DBScanStarter,
    renderComponent: DBScanRender
}

export const globalStore = new RuntimeStore<DBScanState, DBScanEvent, DBScanArguments>(dbscan);

export const bind = (name: keyof DBScanState, value: DBScanState[keyof DBScanState]) => {
    globalStore.bind(name, value);
}

export const here = async (name: DBScanEvent["name"], ...args: DBScanEvent["args"]): Promise<void> => {
    return globalStore.here(name, ...args);
}
