import { DBScanEvent, DBScanState } from "./dbscan";

export type RenderProps = {
    curState: DBScanState;
    curEvent: DBScanEvent;
}

export const DBScanRender = ({ curState, curEvent }) => {
    console.log("Rendering", curState, curEvent);
    return <div>TODO: render</div>;
}