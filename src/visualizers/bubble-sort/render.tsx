import { RenderProps } from "../../lib/manifest"
import { BubbleSortEvent, BubbleSortState } from "./bubble-sort"

// export type RenderProps = {
//     curState: BubbleSortState;
//     curEvent: BubbleSortEvent;
// }

const COLORS = {
    "compare": "red",
    "swap": "green",
    "done": "cyan"
}

const getColor = (event: BubbleSortEvent, index: number) => {
    if (event.name === "done") {
        return COLORS["done"]
    } else {
        if(event.args.includes(index)) {
            return COLORS[event.name]
        }
    }
}

export const BubbleSortRender = ({ curState, curEvent }: RenderProps<BubbleSortState, BubbleSortEvent>) => {
    console.log("Rendering", curState, curEvent)
    const comparing = curEvent?.args
    return <div>
        Renderer:
        <div>
            {curState && curState.array.map((value, index) => {
                return <div key={value + "!" + index} style={{
                    backgroundColor: getColor(curEvent, index)
                }}>
                    {value}
                </div>
            })}
        </div>
        {JSON.stringify(comparing)}
    </div>
}