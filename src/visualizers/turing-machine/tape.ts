import { immerable } from "immer"

export class Tape {
    [immerable] = true

    _tapeContainer: Map<number, string> = new Map()

    constructor() { }

    copy(): Tape {
        const newTape = new Tape()
        newTape._tapeContainer = new Map(this._tapeContainer)
        return newTape
    }

    set(index: number, value: string) {
        this._tapeContainer.set(index, value)
    }

    get(index: number): string {
        return this._tapeContainer.get(index)
    }
}