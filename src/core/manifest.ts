import { FC } from "react"
import { RuntimeStore } from "./store"

export type IEvent = { name: string; args: unknown[] };
export type IState = object;
export type IArguments = unknown[];

export type StartProps<Arguments extends IArguments> = {
  doStart: (args: Arguments, noStop: boolean) => void;
};

export type RenderProps<State extends IState, Event extends IEvent> = {
  curState: State;
  curEvent: Event;
};

export type IAlgorithmManifest<
  State extends IState = IState,
  Event extends IEvent = IEvent,
  Arguments extends IArguments = IArguments,
> = {
  algo: (...args: Arguments) => Promise<void>; // fixme: Return type should not be Promise<void>
  startComponent: FC<StartProps<Arguments>>;
  renderComponent: FC<RenderProps<State, Event>>;
};

export const initAlgo = <
  State extends IState,
  Event extends IEvent,
  Arguments extends IArguments,
  Manifest extends IAlgorithmManifest<State, Event, Arguments>,
>(
        manifest: Manifest
    ): {
  store: RuntimeStore<State, Event, Arguments>;
  here: (name: Event["name"], ...args: Event["args"]) => Promise<void>;
  bind: (name: keyof State, value: State[keyof State]) => void;
} => {
    const store = new RuntimeStore<State, Event, Arguments>(manifest.algo)
    return {
        store,
        bind: (name, value) => store.bind(name, value),
        here: (name, ...args) => store.here(name, ...args),
    }
}
