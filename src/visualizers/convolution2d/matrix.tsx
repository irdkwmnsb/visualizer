// TODO: move to lib?

import { constant, times } from "lodash";

export interface Matrix {
    height: number;
    width: number;
    get: (row: number, column: number) => number;
}

export const enum PaddingType {
    Reflect, Wrap, Edge, Zero 
}

export class ArrayMatrix implements Matrix {
    height: number;
    width: number;

    constructor(private array: number[][]) {
        this.height = array.length;
        this.width = array[0].length;
    }

    get(row: number, column: number) {
        return this.array[row][column];
    }

    set(row: number, column: number, value: number) {
        this.array[row][column] = value;
    }
}

export class PaddedMatrix implements Matrix {
    height: number;
    width: number;

    constructor(
        private matrix: Matrix,
        public padding: number,
        public paddingType: PaddingType,
    ) {
        this.height = matrix.height + 2 * padding;
        this.width = matrix.width + 2 * padding;
    }

    get(row: number, column: number) {
        return this.matrix.get(
            recalculateIndex(row, this.matrix.height, this.padding, this.paddingType),
            recalculateIndex(column, this.matrix.width, this.padding, this.paddingType),
        );
    }
}

export const emptyMatrix = (height: number, width: number): ArrayMatrix => {
    console.log(times(width, 0));
    return new ArrayMatrix(times(height, () => times(width, constant(0))));
}

const recalculateIndex = (
    index: number,
    length: number,
    padding: number,
    paddingType: PaddingType
) => {
    const correctedIndex = index - padding;
    if (correctedIndex >= 0 && correctedIndex < length) {
        return correctedIndex;
    }
    switch (paddingType) {
        case PaddingType.Reflect:
            return reflectIndex(correctedIndex, length);
        case PaddingType.Wrap:
            return wrapIndex(correctedIndex, length);
        case PaddingType.Edge:
            return edgeIndex(correctedIndex, length);
        case PaddingType.Zero:
            return 0;
    }
}

const reflectIndex = (index: number, length: number) =>
    index < 0 ? -index : 2 * length - index - 2;

const wrapIndex = (index: number, length: number) =>
    index < 0 ? (index % length) + length : index % length;

const edgeIndex = (index: number, length: number) =>
    index < 0 ? 0 : length - 1;
