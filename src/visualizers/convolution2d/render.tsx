import { Convolution2DEvent, Convolution2DState, ConvolutionStepMeta } from "./convolution2d";
import { Matrix } from "./matrix";
import { range } from "lodash";

export type RenderProps = {
    curState: Convolution2DState;
    curEvent: Convolution2DEvent;
}

export const Convolution2DRender = ({ curState, curEvent }) => {
    console.log("Rendering", curState, curEvent);
    const matrix = curState?.matrix.value;
    console.log(matrix);
    switch (curEvent?.name) {
        case "convolution_step":
            const [meta]: [ConvolutionStepMeta] = curEvent.args;    
            return <div>
                Input:
                {matrixRender(matrix, 0, (y, x) => 
                    meta.inputYfrom <= y && y < meta.inputYto &&
                    meta.inputXfrom <= x && x < meta.inputXto)}
                Kernel:
                {matrixRender(curState?.kernel)}
                Result:
                {matrixRender(curState?.result, 0, (y, x) =>
                    meta.outputY === y && meta.outputX === x)}
            </div>;
        case "add_padding":
            const [padding]: [number] = curEvent.args;
            return <div>
                Input:
                {matrixRender(matrix, padding)}
                Kernel:
                {matrixRender(curState?.kernel)}
                Result:
                {matrixRender(curState?.result)}
            </div>;
        default:    
            return curState && <div>
                Input:
                {matrixRender(matrix)}
                Kernel:
                {matrixRender(curState?.kernel)}
                Result:
                {matrixRender(curState?.result)}
            </div>;
    }
}

const matrixRender = (
    matrix: Matrix,
    padding: number = 0,
    isActive: (y: number, x: number) => boolean = () => false,
) => {
    const isPadding = (row: number, col: number) =>
        row < padding || row >= matrix.height - padding ||
        col < padding || col >= matrix.width - padding;
    return <table>
        <tbody>
        {matrix && range(matrix.height).map(y =>
            <tr>{range(matrix.width).map(x =>
                <td style={{
                    color: isActive(y, x) ? "red" : "black",
                    backgroundColor: isPadding && isPadding(y, x) ? "#e0e0e0" : "white"
                }}>{matrix.get(y, x)}</td>
            )}</tr>
        )}
        </tbody>
    </table>;
}
