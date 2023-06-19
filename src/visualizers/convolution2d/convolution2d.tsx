import { bind, here } from "./";
import { Matrix, PaddingType, PaddedMatrix, emptyMatrix } from "./matrix";
import { range, sumBy } from "lodash";

export const convolution2d = async (
    input: Matrix,
    kernel: Matrix,
    padding: number,
    step: number,
    paddingType: PaddingType,
) => {
    const matrix = new Mutable(input);
    const resultHeight = sizeAfterConvolution(input.height, kernel.height, padding, step);
    const resultWidth = sizeAfterConvolution(input.width, kernel.width, padding, step); 
    const result = emptyMatrix(resultHeight, resultWidth);

    bind("matrix", matrix);
    bind("kernel", kernel);
    bind("result", result);

    await here("start");
    matrix.value = new PaddedMatrix(matrix.value, padding, paddingType);
    await here("add_padding", padding);
    for (let y = 0; y < result.height; y++) {
        for (let x = 0; x < result.width; x++) {
            const sum = sumBy(range(kernel.height), ky =>
                sumBy(range(kernel.width), kx =>
                    kernel.get(ky, kx) * matrix.value.get(y * step + ky, x * step + kx)
                )
            );
            result.set(y, x, sum);

            const meta: ConvolutionStepMeta = {
                inputXfrom: x * step,
                inputXto: x * step + kernel.width,
                inputYfrom: y * step,
                inputYto: y * step + kernel.height,
                outputX: x,
                outputY: y,
            };
            await here("convolution_step", meta);
        }
    }
    await here("done");
}

const sizeAfterConvolution = (size: number, kernelSize: number, padding: number, step: number) =>
    Math.floor((size - kernelSize + 2 * padding) / step) + 1;

// TODO: move to lib?
class Mutable<T> {
    constructor(public value: T) {}
}

export type Convolution2DState = {
    matrix: Mutable<Matrix>,
    kernel: Matrix,
    padding: number,
    step: number,
    paddingType: PaddingType,
    result: Matrix,
}

export type Convolution2DEvent = Start | Done | AddPaddingEvent | ConvolutionStepEvent;

// TODO: move Start and Done to lib?
type Start = {
    name: "start",
    args: [],
}
type Done = {
    name: "done",
    args: [],
}
type AddPaddingEvent = {
    name: "add_padding",
    args: [padding: number],
}
type ConvolutionStepEvent = {
    name: "convolution_step",
    args: [meta: ConvolutionStepMeta],
}

export type ConvolutionStepMeta = {
    inputXfrom: number,
    inputXto: number,
    inputYfrom: number,
    inputYto: number,
    outputX: number,
    outputY: number,
}

export type Convolution2DArguments = [Matrix, Matrix, number, number, PaddingType];
