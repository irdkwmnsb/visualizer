import _ from "lodash"

type BaseEvent = {
    name: string,
    args: unknown[]
};

type StoredEvent<Event extends BaseEvent, State> = Event & {
    state: State;
}

type Snapshot<State, Event extends BaseEvent, Arguments> = {
    curState?: State;
    curEvent?: StoredEvent<Event, State>;
    currentStep?: number;
    events?: StoredEvent<Event, State>[];
    bindedObjects?: Record<string, unknown>;
    next: () => void;
    start: (args: Arguments, noStop: boolean) => void;
}

export class RuntimeStore<State, Event extends BaseEvent, Arguments extends unknown[]>  {
    events: StoredEvent<Event, State>[] = []
    bindedObjects: Record<keyof State, State[keyof State]> = {} as Record<keyof State, State[keyof State]> // TODO: fix this
    continuation?: () => void
    subscribers: (() => void)[] = []
    algorithm?: (...args) => Promise<void>
    currentStep = 0
    noStop = false

    constructor(algorithm: (...args: Arguments) => Promise<void>) {
        this.algorithm = algorithm
    }

    bind = (name: keyof State, value: State[keyof State]) => {
        console.log("Binded", name)
        this.bindedObjects[name] = value
    }

    here = async (name: Event["name"], ...args: Event["args"]): Promise<void> => {
        console.log("!!", this.bindedObjects)
        this.currentStep++
        this.events.push({
            name,
            args,
            state: _.cloneDeep(this.bindedObjects) as State,
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

    get curState () {
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
            bindedObjects: this.bindedObjects,
            next: this.next,
            start: this.start,
        }
    }

    getCurSnapshot = () => {
        return this._dataSnapshot
    }

    start = (args: Arguments, noStop: boolean) => {
        this.events = []
        this.continuation = undefined
        this.currentStep = 0
        this.bindedObjects = {} as Record<keyof State, State[keyof State]> // TODO: fix this
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