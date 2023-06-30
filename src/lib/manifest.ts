import { FC } from "react"

export type StartProps<Arguments> = {
    doStart: (args: Arguments, noStop: boolean) => void
}

export type RenderProps<State, Event> = {
    curState: State;
    curEvent: Event;
}

export type AlgorithmManifest<State, Event, Arguments extends unknown[]> = {
    algo: (...args: Arguments) => Promise<void>,
    startComponent: FC<StartProps<Arguments>>,
    renderComponent: FC<RenderProps<State, Event>>
}