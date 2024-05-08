import classes from "./array.module.scss"
import classNames from "classnames"
import { RenderableData } from "../../temp"
import { Color } from "../../visuals/colors"
import { CSSProperties, SVGProps } from "react"

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
    /** Can either be an array of indecies to color, or an object specifying color for each index, or a function to return color for each index */
    colors?: Record<number, Color> | number[] | ((index: number, value: T) => Color | undefined),
    /** Color of this array */
    color?: Color | false
}

const Pointer = <T extends SVGSVGElement,>({color="FFF", ...props}: SVGProps<T> & {color?: string}) =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={17}
        height={34}
        viewBox="0 0 34 68"
        {...props}
    >
        <path
            fill="#FFF"
            d="M22 68H12C5.4 68 0 62.6 0 56V12C0 5.4 5.4 0 12 0h10c6.6 0 12 5.4 12 12v44c0 6.6-5.4 12-12 12z"
        />
        <path
            fill="none"
            stroke={color}
            strokeMiterlimit={9.999}
            strokeWidth={4}
            d="M4.7 22 17 9.8 29.2 22M17 9.8V61"
        />
    </svg>

export const VisArray = <T extends RenderableData,>({ 
    array,
    direction = "row", 
    highlights = {}, 
    colors = {}, 
    pointers = {},
    color = undefined 
}: VisArrayProps<T>) => {
    const needsPointers = (pointers instanceof Array && pointers.length !== 0) || 
                          (pointers instanceof Object && Object.keys(pointers).length !== 0)
    return <div className={classNames(classes.arrayBox, classes[direction], {
        [classes.withPointers]: needsPointers
    })}>
        {array.map((el, index) => {
            const addedStyles: CSSProperties =  {}
            if (highlights[index] !== undefined) { // todo: add support for arrays 
                addedStyles.outline = "2px solid " + highlights[index]
            }
            
            if (color !== undefined && color !== false) { 
                addedStyles.backgroundColor = color
            } else {
                if (typeof colors === "function") {
                    const color = colors(index, el)
                    if (color !== undefined) {
                        addedStyles.backgroundColor = color
                    }
                } else if (Array.isArray(colors)) {
                    if (colors.indexOf(index) !== -1) {
                        addedStyles.backgroundColor = "gray"
                    }
                } else if(colors[index] !== undefined) {
                    addedStyles.backgroundColor = colors[index]
                }
            }

            let pointer = null
            if (pointers[index] !== undefined) { // todo: add support for arrays and labels
                pointer = <Pointer color={pointers[index]}/>
            }
            return <div
                key={el + "-" + index}
                className={classes.arrayElement}
                style={addedStyles}
            >
                {el}
                <div className={classes.pointer}>
                    {pointer}
                </div>
            </div>
        })}
    </div>
}