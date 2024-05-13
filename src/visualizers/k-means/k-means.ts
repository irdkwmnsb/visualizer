import _ from "lodash"
import { bind, here, update } from "."

type Point = [number, number]

export const kMeans = async (k: number, points: Point[]) => {
    bind("points", points)
    let centers = _.sampleSize(points, k)
    update("centers", centers)
    await here("update", centers)

    const distance = (a: Point, b: Point) => Math.sqrt(Math.pow((b[0] - a[0]), 2) + Math.pow((b[1] - a[1]), 2))

    let converged = false
    for (;;) {
        const clusters: number[] = points.map((point) => _.minBy(_.range(0, centers.length), (centerIndex: number) => distance(centers[centerIndex], point))!)
        await here("assign", clusters)
        if (converged) {
            break
        }
        const means = new Array(centers.length).fill(null).map(() => ({
            sumX: 0,
            sumY: 0,
            count: 0
        }));
        (_.zip(clusters, points) as [number, Point][]).forEach(([clusterN, [x, y]]) => { // TODO: remove ugly cast somehow
            means[clusterN].sumX += x
            means[clusterN].sumY += y
            means[clusterN].count++
        })
        const newCenters = means.map(({sumX, sumY, count}) => [sumX / count, sumY / count]) as Point[]
        converged = _.isEqual(newCenters, centers)
        const oldCenters = centers
        centers = newCenters
        update("centers", centers)
        await here("update", oldCenters)
    }
}


export type KMeansState = {
    points: Point[]
    centers: Point[]
}

export type KMeansEvent = {
    name: "assign",
    args: [number[]]
} | {
    name: "update",
    args: [Point[]]
}

export type KMeansArguments = Parameters<typeof kMeans>;


