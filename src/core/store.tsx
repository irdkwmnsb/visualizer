import _ from "lodash"
import { IEvent, IState, IArguments, EventOrError } from "./manifest"

type StoredEvent<Event extends EventOrError<IEvent>, State extends IState> = Event & {
  state: State | null;
};

export type Snapshot<
  State extends IState,
  Event extends IEvent,
  Arguments extends IArguments,
> = {
  curState?: State;
  curEvent?: StoredEvent<EventOrError<Event>, State>;
  currentStep?: number;
  events?: StoredEvent<EventOrError<Event>, State>[];
  bindedObjects?: State;
  config: {
    noStop: boolean,
    storeEvents: boolean,
    storeStates: boolean
  }
  next: () => void;
  start: (args: Arguments, noStop: boolean) => void;
}; // TODO: make union type for when the algorithm is not started.

export class RuntimeStore<
  State extends IState = IState,
  Event extends IEvent = IEvent,
  Arguments extends IArguments = IArguments,
> {
    events: StoredEvent<Event, State>[] = []
    curEvent?: StoredEvent<Event, State> = undefined
    curState: State = {} as State
    curStep = 0

    continuation?: () => void
    subscribers: (() => void)[] = []
    algorithm: (...args: Arguments) => Promise<void>
    error?: Error // FIXME: this should be somehow parametrized?

    noStop = false
    storeEvents = true
    storeStates = true

    constructor(algorithm: (...args: Arguments) => Promise<void>) {
        this.algorithm = algorithm
    }

    bind = (name: keyof State, value: State[keyof State]) => {
        if (!(value instanceof Object)) {
            console.warn(
                `${String(
                    name
                )} is not an object, so it won't be binded and watched for changes. ` +
          "If you need to use it in the renderer, you should probably pass it in \"here\""
            )
            
        }
        this.curState[name] = value
    }

    here = async (name: Event["name"], ...args: Event["args"]): Promise<void> => {
        this.curStep++
        this.curEvent = {
            name,
            args,
            // TODO: use Immer if this becomes too heavy.
            // Immer allows to watch for modifications of deep nested objects.
            state: this.storeStates ? _.cloneDeep(this.curState) as State : null,
        } as StoredEvent<Event, State>
        if (this.storeEvents) {
            this.events.push(this.curEvent)
        }
        if (this.noStop) {
            return Promise.resolve()
        }
        this.notifyReact()
        return new Promise((resolve) => {
            this.continuation = resolve
        })
    }

    next = () => {
        if (this.continuation) {
            this.continuation()
        }
    }

    // get curState(): State {
    //     // return this.events[this.currentStep - 1]?.state
    //     return this.state
    // }

    // get curEvent() {
    //     return this.events[this.currentStep - 1]
    // }

    notifyReact = () => {
        this.updateSnapshot()
        this.subscribers.forEach((x) => x())
    }

    updateSnapshot = () => {
        this._dataSnapshot = {
            curState: this.curState,
            curEvent: this.error === undefined ? this.curEvent : {name: "error", error: this.error, state: null},
            currentStep: this.curStep,
            events: this.events,
            bindedObjects: this.curState,
            next: this.next,
            start: this.start,
            config: {
                storeEvents: this.storeEvents,
                storeStates: this.storeStates,
                noStop: this.noStop
            }
        }
    }

    getCurSnapshot = (): Snapshot<State, Event, Arguments> => {
        return this._dataSnapshot
    }

    start = (args: Arguments, noStop: boolean) => {
        this.events = []
        this.continuation = undefined
        this.curStep = 0
        this.curState = {} as State
        this.noStop = noStop
        this.error = undefined
        this.curEvent = undefined
        this.notifyReact()
        this.algorithm(...args).then(() => {
            this.notifyReact()
        }).catch((e) => {
            this.error = e
            this.notifyReact()
        })
    }

    subscribe = (callback: () => void) => {
        this.subscribers.push(callback)
        return () => {
            this.subscribers = this.subscribers.filter((x) => x !== callback)
        }
    }

    _dataSnapshot: Snapshot<State, Event, Arguments> = {
        start: this.start,
        next: this.next,
        config: {
            storeEvents: this.storeEvents,
            storeStates: this.storeStates,
            noStop: this.noStop
        }
    }
}
