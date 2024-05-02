import _ from "lodash"
import { usePrevious } from "../../utils"
import { Tape } from "./tape"
import styles from "./tape-render.module.scss"
import { memo } from "react"
import classNames from "classnames"

const VIEWPORT = 10


type TapeCellProps = {
    index: number
    value: string
    headPosition: number
}

const TapeCell = memo(function TapeCell({index, value, headPosition}: TapeCellProps) {
    const indexFromLeft = index - headPosition + VIEWPORT - 1
    const prevValue = usePrevious(value)
    return (
        <div className={styles.cell} key={index} style={{
            left: indexFromLeft * 30 + indexFromLeft * 15 + "px",
            zIndex: index
        }}>
            {prevValue !== value &&
                <div className={classNames(styles.cellContent, styles.slideOut)} key={prevValue}>
                    {prevValue}
                </div>
            }
            <div className={classNames(styles.cellContent, {
                [styles.slideIn]: prevValue !== value
            })} key={value}>
                {value}
            </div>
            <div className={styles.cellNumber}>
                {index}
            </div>
        </div>
    )
})

type TapeRenderProps = {
    tape: Tape
    headPosition: number,
    label?: string
}

export const TapeRender = ({tape, headPosition, label = "Tape"}: TapeRenderProps) => {
    const prevHeadPosition = usePrevious(headPosition)
    const diff = headPosition - (prevHeadPosition ?? 0)
    const leftAdd = diff < 0 ? Math.abs(diff) : 0
    const rightAdd = diff > 0 ? diff : 0
 
    return <div className={styles.container}>
        <div className={styles.label}>
            {label}:
        </div>
        <div className={styles.cells} style={{
            width: (VIEWPORT * 2 - 1) * 30 + (VIEWPORT * 2 - 2) * 15 + "px"
        }}>
            {_.range(headPosition - VIEWPORT - leftAdd, headPosition + VIEWPORT + 1 + rightAdd).map((index) => (
                <TapeCell value={tape.get(index)} index={index} headPosition={headPosition} key={index}/>
            ))}
            <div className={styles.cell + " " + styles.middleCell}>

            </div>
        </div>
    </div>
}