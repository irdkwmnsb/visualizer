import { RenderableData } from "../../temp"
import styles from "./ndarray.module.scss"
import { Color } from "../../visuals/colors"
import { CSSProperties } from "react"

type VisNDArrayProps<T> = {
    array: T[][],
    label: string
    /** Can either be a record of "row,col" keys to colors, or an array of [row, col] tuples to highlight */
    highlightCells?: Record<string, Color> | Array<[number, number]>,
    /** Can either be a record of row indices to colors, or an array of row indices to highlight */
    highlightRows?: Record<number, Color> | number[],
    /** Can either be a record of column indices to colors, or an array of column indices to highlight */
    highlightColumns?: Record<number, Color> | number[],
    /** Can either be a record of "row,col" keys to colors, or a function to return color for each cell */
    colors?: Record<string, Color> | ((rowIndex: number, colIndex: number, value: T) => Color | undefined),
} & (
    T extends number ? {
        roundTo?: number
    } 
    : unknown)

const NumberCell = ({value, roundTo} : {value: number, roundTo: number}) => {
    const whole = Math.floor(value)
    const rational = Math.round((Math.abs(value) % 1) * Math.pow(10, roundTo))
    return <div className={styles.numberCell}>
        <div className={styles.whole}>{(whole + "").replace("-", "−")}</div>
        <div className={styles.dot}>.</div>
        <div className={styles.rational} style={{
            width: roundTo + "ch"
        }}>{rational}</div>
    </div>
}

export const VisNDArray = <T extends RenderableData,>(props: VisNDArrayProps<T>) => {
    const maxElems = props.array.reduce((a, b) => Math.max(a, b.length), 0)
    const { highlightCells = {}, highlightRows = {}, highlightColumns = {}, colors = {} } = props

    // Helper function to check if a cell should be highlighted
    const getCellHighlight = (rowIndex: number, colIndex: number): Color | undefined => {
        const cellKey = `${rowIndex},${colIndex}`
        
        // Check cell-specific highlights
        if (typeof highlightCells === 'object' && !Array.isArray(highlightCells)) {
            if (highlightCells[cellKey] !== undefined) {
                return highlightCells[cellKey]
            }
        } else if (Array.isArray(highlightCells)) {
            if (highlightCells.some(([r, c]) => r === rowIndex && c === colIndex)) {
                return Color.YELLOW // Default color for array-based highlights
            }
        }

        // Check row highlights
        if (typeof highlightRows === 'object' && !Array.isArray(highlightRows)) {
            if (highlightRows[rowIndex] !== undefined) {
                return highlightRows[rowIndex]
            }
        } else if (Array.isArray(highlightRows)) {
            if (highlightRows.indexOf(rowIndex) !== -1) {
                return Color.YELLOW // Default color for array-based highlights
            }
        }

        // Check column highlights
        if (typeof highlightColumns === 'object' && !Array.isArray(highlightColumns)) {
            if (highlightColumns[colIndex] !== undefined) {
                return highlightColumns[colIndex]
            }
        } else if (Array.isArray(highlightColumns)) {
            if (highlightColumns.indexOf(colIndex) !== -1) {
                return Color.YELLOW // Default color for array-based highlights
            }
        }

        return undefined
    }

    // Helper function to get cell color
    const getCellColor = (rowIndex: number, colIndex: number, value: T): Color | undefined => {
        if (typeof colors === "function") {
            return colors(rowIndex, colIndex, value)
        } else if (typeof colors === "object") {
            const cellKey = `${rowIndex},${colIndex}`
            return colors[cellKey]
        }
        return undefined
    }

    return <div>
        {props.label}
        <table className={styles.table}>
            <thead>
                <tr>
                    <td></td>
                    {new Array(maxElems).fill(null).map((_, index) => {
                        const highlight = typeof highlightColumns === 'object' && !Array.isArray(highlightColumns) 
                            ? highlightColumns[index]
                            : Array.isArray(highlightColumns) && highlightColumns.indexOf(index) !== -1
                                ? Color.YELLOW
                                : undefined
                        const cellStyle: CSSProperties = highlight ? { outline: `2px solid ${highlight}` } : {}
                        return (
                            <td key={index} style={cellStyle}>
                                {index}
                            </td>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {props.array.map((row, rowIndex) => {
                    return (
                        <tr key={rowIndex}>
                            <td>
                                {rowIndex}
                            </td>
                            {row.map((el, colIndex) => {
                                const cellHighlight = getCellHighlight(rowIndex, colIndex)
                                const cellColor = getCellColor(rowIndex, colIndex, el)
                                const cellStyle: CSSProperties = {}
                                
                                if (cellHighlight) {
                                    cellStyle.outline = `2px solid ${cellHighlight}`
                                }
                                if (cellColor) {
                                    cellStyle.backgroundColor = cellColor
                                }

                                return (
                                    <td key={rowIndex + "-" + colIndex} style={cellStyle}>
                                        {
                                            typeof el === "number" ? 
                                                <NumberCell value={el} roundTo={(props as VisNDArrayProps<typeof el>).roundTo ?? 2}/>
                                                : 
                                                el
                                        }
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
}