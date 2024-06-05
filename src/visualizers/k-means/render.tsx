import { useEffect, useRef } from "react"
import { RenderProps } from "../../core/manifest"
import { KMeansEvent, KMeansState } from "./k-means"
import Chart, { Colors } from "chart.js/auto"
import annotationPlugin from "chartjs-plugin-annotation"
import _ from "lodash"
import { createColorMap, linearScale } from "@colormap/core"
import { viridis } from "@colormap/presets"
import { Point } from "../../data/points"
import { VisNDArray } from "../../components/array/ndarray"


Chart.register(Colors)
Chart.register(annotationPlugin)



export const KMeansRender = ({ curState, curEvent }: RenderProps<KMeansState, KMeansEvent>) => {
    const divref = useRef<HTMLCanvasElement>(null)
    const chartRef = useRef<Chart | null>(null)
    useEffect(() => {
        if (divref.current === null) {
            return
        }
        chartRef.current = new Chart(divref.current,
            {
                type: "scatter",
                data: {
                    datasets: [
                        {
                            label: "Centers",
                            data: [],
                            pointRadius: 15,
                            pointStyle: "cross",
                            pointBorderColor: "red"
                        },
                        {
                            label: "Points",
                            data: curState.points,
                            animation: false,
                            pointBorderWidth: 0
                        }
                    ]
                }
            }
        )
        return () => {
            chartRef.current?.destroy()
        }
    }, [])
    useEffect(() => {
        if (chartRef.current === null) {
            return 
        }
        const [centers, points] = chartRef.current.data.datasets
        chartRef.current.options.plugins!.annotation!.annotations = []
        const cmap = createColorMap(viridis, linearScale([0, curState.centers.length], [0, 1]))
        if (curEvent.name === "assign") {
            points.backgroundColor = (data: { dataIndex: number }) => {
                const clusterId = curEvent.args[0][data.dataIndex]
                const [r, g, b] = cmap(clusterId)
                const color = `rgb(${r * 256} ${g * 256} ${b * 256})`
                return color
            }
        } else {
            const oldCenters = curEvent.args[0]
            points.backgroundColor = undefined
            chartRef.current.options.plugins!.annotation!.annotations =
            _.fromPairs((_.zip(oldCenters, curState.centers) as [Point, Point][]).map(([[oldX, oldY], [newX, newY]], index) => (
                ["cluster-" + index,
                    {
                        type: "line",
                        xMin: oldX,
                        xMax: newX,
                        yMin: oldY,
                        yMax: newY,
                        arrowHeads: {
                            end: {
                                display: true
                            }
                        }
                    }
                ]
            )))
        }
        points.data = curState.points
        centers.data = curState.centers
        chartRef.current.update()
    }, [curState, curEvent])
    return <div style={{display: "flex", flexDirection: "row", width: "100%", height: "100%"}}>
        <div>
            <canvas ref={divref} width="500" height="500"></canvas>
        </div>
        <VisNDArray array={curState.centers} label="Centers"/>
    </div>
}