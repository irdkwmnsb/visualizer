import { FC } from "react"
import { RuntimeStore } from "./store"

export type IEvent = { name: Exclude<string, "error">; args: unknown[] };
export type EventOrError<Event extends IEvent> = Event | { name: "error"; error: Error };
export type IState = object;
export type IArguments = unknown[];

export type StartProps<Arguments extends IArguments> = {
  doStart: (args: Arguments, noStop: boolean) => void;
};

export type RenderProps<State extends IState, Event extends IEvent> = {
  curState: State;
  curEvent: Event;
};

export type SafeRenderProps<State extends IState, Event extends IEvent> = {
  curState: State;
  curEvent: EventOrError<Event>;
};

export type IAlgorithmManifest<
  State extends IState = IState,
  Event extends IEvent = IEvent,
  Arguments extends IArguments = IArguments,
> = {
  algo: (...args: Arguments) => Promise<void>; // fixme: Return type should not be Promise<void>
  startComponent: FC<StartProps<Arguments>>;
  renderComponent: FC<SafeRenderProps<State, Event>>;
  nameRu: string; // TODO: Think about i18n a bit more.
  nameEn: string;
  authorRu: string;
  authorEn: string;
  descriptionRu: string;
  descriptionEn: string;
} | {
  algo: (...args: Arguments) => Promise<void>; // fixme: Return type should not be Promise<void>
  startComponent: FC<StartProps<Arguments>>;
  renderComponent: FC<RenderProps<State, Event>>;
  handleErrorsForMe: true; // TODO: naming is weird but whatever
  nameRu: string; // TODO: Think about i18n a bit more.
  nameEn: string;
  authorRu: string;
  authorEn: string;
  descriptionRu: string;
  descriptionEn: string;
};

export const initAlgo = <
  State extends IState,
  Event extends IEvent,
  Arguments extends IArguments,
  Manifest extends IAlgorithmManifest<State, Event, Arguments>,
>(
        manifest: Manifest
    ): {
  store: RuntimeStore<State, Event, Arguments>; // TODO: not sure how to remove RuntimeStore everywhere here
  here: RuntimeStore<State, Event, Arguments>["here"];
  bind: RuntimeStore<State, Event, Arguments>["bind"];
  update: RuntimeStore<State, Event, Arguments>["update"];
} => {
    const store = new RuntimeStore<State, Event, Arguments>(manifest.algo)
    return {
        store,
        bind: (name, value) => store.bind(name, value),
        update: (name, newValue) => store.update(name, newValue),
        here: (name, ...args) => store.here(name, ...args),
    }
}
