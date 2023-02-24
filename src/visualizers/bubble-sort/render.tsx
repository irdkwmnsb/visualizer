import { BubbleSortEvent, BubbleSortState } from "./bubble-sort";

export type RenderProps = {
    curState: BubbleSortState;
    curEvent: BubbleSortEvent;
}

const COLORS = {
    "compare": "red",
    "swap": "green",
    "done": "cyan"
}

export const BubbleSortRender = ({ curState, curEvent }) => {
    console.log("Rendering", curState, curEvent);
    const comparing = curEvent?.args;
    return <div>
        Renderer:
        <div>
            {curState && curState.array.map((value, index) => {
                return <div key={value + "!" + index} style={{
                    backgroundColor: comparing?.includes(index) || curEvent.name === "done" ? COLORS[curEvent.name] : "white"
                }}>
                    {value}
                </div>
            })}
        </div>
        {JSON.stringify(comparing)}
    </div>;
}