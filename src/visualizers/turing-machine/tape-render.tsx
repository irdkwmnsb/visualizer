import _ from "lodash"
import { usePrevious } from "../../utils"
import { Tape } from "./tape"
import styles from "./tape-render.module.scss"

const VIEWPORT = 10

type TapeRenderProps = {
    tape: Tape
    headPosition: number,
    label?: string
    animation: {
        type: "replaceAtHead",
        prevValue: string,
        newValue: string
    }
}

export const TapeRender = ({tape, headPosition, label = "Tape", animation}: TapeRenderProps) => {
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
            {_.range(headPosition - VIEWPORT - leftAdd, headPosition + VIEWPORT + 1 + rightAdd).map((index) => {
                const indexFromLeft = index - headPosition + VIEWPORT - 1
                return (
                    <div className={styles.cell} key={index} style={{
                        left: indexFromLeft * 30 + indexFromLeft * 15 + "px"
                    }}>
                        <div>
                            {tape.get(index)}
                        </div>
                        <div className={styles.cellNumber}>
                            {index}
                        </div>
                    </div>
                )
            })}
            <div className={styles.cell + " " + styles.middleCell}>

            </div>
        </div>
    </div>
}