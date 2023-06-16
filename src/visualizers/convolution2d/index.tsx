import { AlgorithmManifest } from "../../lib/manifest";
import { RuntimeStore } from "../../lib/store";
import { Convolution2DArguments, Convolution2DEvent, Convolution2DState, convolution2d } from "./convolution2d";
import { Convolution2DRender } from "./render";
import { Convolution2DStarter } from "./start";

export const manifest: AlgorithmManifest<Convolution2DState, Convolution2DEvent, Convolution2DArguments> = {
    algo: convolution2d,
    startComponent: Convolution2DStarter,
    renderComponent: Convolution2DRender,
}

export const globalStore = new RuntimeStore<Convolution2DState, Convolution2DEvent, Convolution2DArguments>(convolution2d);

export const bind = (name: keyof Convolution2DState, value: Convolution2DState[keyof Convolution2DState]) => {
    globalStore.bind(name, value);
}

export const here = async (name: Convolution2DEvent["name"], ...args: Convolution2DEvent["args"]): Promise<void> => {
    return globalStore.here(name, ...args);
}