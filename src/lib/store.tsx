
type StoredEvent = {
    name: string;
    state: any;
    args: any[];
}

export class RuntimeStore {
    events: StoredEvent[] = [];
    bindedObjects: Record<string, any> = {};
    continuation?: () => void;
    algorithm?: (...args) => Promise<void>;
    currentStep = 0;

    constructor(algorithm: (...args: any[]) => Promise<void>) {
        this.algorithm = algorithm;
    }

    bind(name: string, value: any) {
        this.bindedObjects[name] = value;
    }

    async here(name: string, ...args: any[]): Promise<void> {
        this.currentStep++;
        this.events.push({
            name,
            state: { ...this.bindedObjects },
            args
        });
        return new Promise((resolve) => {
            this.continuation = resolve;
        });
    }

    next() {
        if (this.continuation) {
            this.continuation();
        }
    }

    get curState() {
        return this.events[this.currentStep - 1]?.state;
    }

    get curEvent() {
        return this.events[this.currentStep - 1];
    }

    start(...args: any[]) {
        this.events = [];
        this.continuation = undefined;
        this.currentStep = 0;
        this.bindedObjects = {};
        this.algorithm(...args);
    }
}