import { RenderableData } from "../../temp"
import styles from "./ndarray.module.scss"

type VisNDArrayProps<T> = {
    array: T[][],
    label: string
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
    return <div>
        {props.label}
        <table className={styles.table}>
            <thead>
                <tr>
                    <td></td>
                    {new Array(maxElems).fill(null).map((_, index) => 
                        <td key={index}>
                            {index}
                        </td>)
                    }
                </tr>
            </thead>
            <tbody>
                {props.array.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        <td>
                            {rowIndex}
                        </td>
                        {row.map((el, colIndex) => (
                            <td key={rowIndex + "-" + colIndex}>
                                {
                                    typeof el === "number" ? 
                                        <NumberCell value={el} roundTo={(props as VisNDArrayProps<typeof el>).roundTo ?? 2}/>
                                        : 
                                        el
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}