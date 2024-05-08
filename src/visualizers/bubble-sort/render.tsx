import { VisArray } from "../../components/array/array"
import { RenderProps, SafeRenderProps } from "../../core/manifest"
import { Color } from "../../visuals/colors"
import { BubbleSortEvent, BubbleSortState } from "./bubble-sort"

const COLORS = {
    "compare": Color.BLUE,
    "swap": Color.RED,
}

export const BubbleSortRender = ({ curState, curEvent }: RenderProps<BubbleSortState, BubbleSortEvent>) => {
    const comparing = curEvent?.args
    return <div>
        Renderer:
        <div>
            {curState && <VisArray 
                array={curState.array}
                pointers={{
                    [curEvent.args[0]]: COLORS[curEvent.name],
                    [curEvent.args[1]]: COLORS[curEvent.name]
                }}
                colors={
                    (index) => index + 1 > curState.sortedFrom ? Color.GREEN : undefined
                }
                color={
                    curEvent.name === "done" && Color.GREEN
                }
            />}
        </div>
        {JSON.stringify(comparing)}
    </div>
}