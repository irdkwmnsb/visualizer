import _ from "lodash"
import { IEvent, IState, IArguments } from "./manifest"

type StoredEvent<Event extends IEvent, State extends IState> = Event & {
  state: State;
};

type Snapshot<
  State extends IState,
  Event extends IEvent,
  Arguments extends IArguments,
> = {
  curState?: State;
  curEvent?: StoredEvent<Event, State>;
  currentStep?: number;
  events?: StoredEvent<Event, State>[];
  bindedObjects?: State;
  next: () => void;
  start: (args: Arguments, noStop: boolean) => void;
};

export class RuntimeStore<
  State extends IState = IState,
  Event extends IEvent = IEvent,
  Arguments extends IArguments = IArguments,
> {
    events: StoredEvent<Event, State>[] = []
    state: State = {} as State
    continuation?: () => void
    subscribers: (() => void)[] = []
    algorithm?: (...args) => Promise<void>
    currentStep = 0
    noStop = false

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
        this.state[name] = value
    }

    here = async (name: Event["name"], ...args: Event["args"]): Promise<void> => {
        // console.log("!!", this.state)
        this.currentStep++
        this.events.push({
            name,
            args,
            // TODO: use Immer if this becomes too heavy. 
            // Immer allows to watch for modifications of deep nested objects.
            state: _.cloneDeep(this.state) as State, 
        } as StoredEvent<Event, State>)
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

    get curState() {
        return this.events[this.currentStep - 1]?.state
    }

    get curEvent() {
        return this.events[this.currentStep - 1]
    }

    notifyReact = () => {
        this.updateSnapshot()
        this.subscribers.forEach((x) => x())
    }

    updateSnapshot = () => {
        this._dataSnapshot = {
            curState: this.curState,
            curEvent: this.curEvent,
            currentStep: this.currentStep,
            events: this.events,
            bindedObjects: this.state,
            next: this.next,
            start: this.start,
        }
    }

    getCurSnapshot = (): Snapshot<State, Event, Arguments> => {
        return this._dataSnapshot
    }

    start = (args: Arguments, noStop: boolean) => {
        this.events = []
        this.continuation = undefined
        this.currentStep = 0
        this.state = {} as State
        this.noStop = noStop
        this.notifyReact()
        this.algorithm(...args).then(() => {
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
    }
}
