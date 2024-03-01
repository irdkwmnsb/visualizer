import { VisArray } from "../../components/array"
import { RenderProps } from "../../core/manifest"
import { Color } from "../../visuals/colors"
import { BubbleSortEvent, BubbleSortState } from "./bubble-sort"

// export type RenderProps = {
//     curState: BubbleSortState;
//     curEvent: BubbleSortEvent;
// }

const COLORS = {
    "compare": Color.BLUE,
    "swap": Color.RED,
}

export const BubbleSortRender = ({ curState, curEvent }: RenderProps<BubbleSortState, BubbleSortEvent>) => {
    console.log("Rendering", curState, curEvent)
    const comparing = curEvent?.args
    return <div>
        Renderer:
        <div>
            {curState && <VisArray 
                array={curState.array}
                highlights={{
                    [curEvent.args[0]]: COLORS[curEvent.name],
                    [curEvent.args[1]]: COLORS[curEvent.name]
                }}
                pointers={{
                    
                }}
                color={
                    curEvent.name === "done" && Color.GREEN
                }
            />}
        </div>
        {JSON.stringify(comparing)}
    </div>
}