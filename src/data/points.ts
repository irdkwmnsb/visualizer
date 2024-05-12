import _ from "lodash"
import seedrandom from "seedrandom"


export type Point = [number, number]


export const normalRandom = (rand: seedrandom.PRNG, mean: number = 0, stdev: number = 1) => {
    const u = 1 - rand.double()
    const v = rand.double()
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    return z * stdev + mean
}

export const uniformRandom = (rand: seedrandom.PRNG, from: number, to: number) => {
    const random = rand.double()
    return random * (to - from) + from
}

export const shuffleXY = <X extends unknown[], Y extends unknown[]>(rand: seedrandom.PRNG, x: X, y: Y) => {
    const n = x.length
    if (y.length !== n) {
        throw Error("Cannot shuffle X and Y when their sizes differ")
    }
    for (let i = n - 1; i >= 1; i--) {
        const j = Math.floor(uniformRandom(rand, 0, i + 1))
        const tempX = x[i]
        x[i] = x[j]
        x[j] = tempX
        const tempY = y[i]
        y[i] = y[j]
        y[j] = tempY
    }
}

export const uniformRandomPoints = (n: number, rand: seedrandom.PRNG, boundingBox: [Point, Point]): Point[] => {
    const newLocal = (new Array(n)).fill(null).map(() => {
        const x = uniformRandom(rand, boundingBox[0][0], boundingBox[1][0])
        const y = uniformRandom(rand, boundingBox[0][1], boundingBox[1][1])
        return [x, y]
    })
    return newLocal as Point[]
}

export function makeBlobs ( // todo: replace this with settings object
    nSamples?: number | number[], 
    centers?: number | Point[] | undefined,
    clusterStd?: number | number[],
    centerBox?: [number, number],
    randomState?: string | seedrandom.PRNG,
    returnCenters?: true
): [Point[], number[], Point[]]
export function makeBlobs (
    nSamples?: number | number[], 
    centers?: number | Point[] | undefined,
    clusterStd?: number | number[],
    centerBox?: [number, number],
    randomState?: string | seedrandom.PRNG,
    returnCenters?: false
): [Point[], number[]]
export function makeBlobs (
    nSamples: number | number[] = 100, 
    centers: number | Point[] | undefined = undefined,
    clusterStd: number | number[] = 1.0,
    centerBox: [number, number] = [-10, 10],
    randomState: string | seedrandom.PRNG = "0",
    returnCenters: boolean = false
) {
    const rand = typeof randomState === "string" ? seedrandom(randomState) : randomState

    let nCenters: number
    if (typeof nSamples === "number") {
        if (centers === undefined) {
            centers = 3
        }
        if (typeof centers === "number") {
            nCenters = centers
            centers = uniformRandomPoints(nCenters, rand, [[centerBox[0], centerBox[0]], [centerBox[1], centerBox[1]]])
        } else {
            nCenters = centers.length
        }
    } else {
        nCenters = nSamples.length
        if (centers === undefined) {
            centers = uniformRandomPoints(nCenters, rand, [[centerBox[0], centerBox[0]], [centerBox[1], centerBox[1]]])
        }
        if (!Array.isArray(centers)) {
            throw TypeError("`centers` must be an array of center points when specifying sizes for each blob")
        }
        if (centers.length !== nCenters) {
            throw TypeError("Length of `centers` must be equal to length of nSamples when specifying sizes for each blob")
        }
    }

    centers as Point[]
    

    const X: Point[] = []
    const y = []
    for (let iCenter = 0; iCenter < nCenters; iCenter++) {
        const nSamplesForCenter = typeof nSamples === "number" ? nSamples : nSamples[iCenter]
        const stdDev = typeof clusterStd === "number" ? clusterStd : clusterStd[iCenter]
        for (let iSample = 0; iSample < nSamplesForCenter; iSample++) {
            X.push([normalRandom(rand, centers[iCenter][0], stdDev),
                normalRandom(rand, centers[iCenter][1], stdDev)])
            y.push(iCenter)
        }
    }

    shuffleXY(rand, X, y)

    if (returnCenters === true) {
        return [X, y, centers]
    } else {
        return [X, y]
    }
}
