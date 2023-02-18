import { BubbleSortEvent, BubbleSortState } from "./bubble-sort";

export type RenderProps = {
    curState: BubbleSortState;
    curEvent: BubbleSortEvent;
}

export const BubbleSortRender = ({ curState, curEvent }) => {
    console.log("Rendering", curState, curEvent);
    return <div>
        Renderer:
        <div>
            {curState && curState.array.map((value, index) => {
                return <div key={value + "!" + index}>
                    {value}
                </div>
            })}
        </div>
        {curEvent}
    </div>;
}