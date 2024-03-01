import classes from "./array.module.scss"
import classNames from "classnames"
import { RenderableData } from "../temp"
import { Color } from "../visuals/colors"
import { CSSProperties } from "react"

/** A pointer is ethier a specific color, or a label, or both specified in an object form */
type PointerProps = {
    /** Color of this pointer */
    color?: Color,
    /** Label of this pointer */
    label?: string
} | Color | string

type VisArrayProps<T extends RenderableData> = {
    /** Elements of the array */
    array: T[],
    /** You can label this array */
    label?: string
    direction?: "column" | "row",
    /** Can either be an array of indecies to highlight, or an object specifying color for each index */
    highlights?: Record<number, Color> | number[],
    /** Can either be an array of indecies to point on, or an object specifying a pointer for each index */
    pointers?: Record<number, PointerProps> | number[], // todo
    /** Can either be an array of indecies to color, or an object specifying color for each index */
    colors?: Record<number, Color> | number[],
    /** Color of this array */
    color?: Color | false
}

export const VisArray = <T extends RenderableData,>({ 
    array,
    direction = "row", 
    highlights = {}, 
    colors = {}, 
    pointers = {},
    color = undefined 
}: VisArrayProps<T>) => {
    return <div className={classNames(classes.arrayBox, classes[direction])}>
        {array.map((el, index) => {
            const addedStyles: CSSProperties =  {}
            if (highlights[index] !== undefined) {
                addedStyles.outline = "2px solid " + highlights[index]
            }
            if (colors[index] !== undefined) {
                addedStyles.backgroundColor = "2px solid " + colors[index]
            }
            if (color !== undefined && color !== false) {
                addedStyles.backgroundColor = color
            }
            return <div
                key={el + "-" + index}
                className={classes.arrayElement}
                style={addedStyles}
            >
                {el}
            </div>
        })}
    </div>
}