import React, { ChangeEvent } from "react";


type Validator<T> = {validate: (val: any) => T | undefined}

interface Parameter<T> {
    tryParseAndSet: (str: string) => boolean;
    get value(): T;
}

export class Num implements Parameter<number> {
    _value: number;

    get value(): number {
        return this._value;
    }

    tryParseAndSet = (str: string) => {
        const newValue = parseFloat(str);
        if (isNaN(newValue)) {
            return false;
        }
        this._value = newValue;
        return true;
    }

    validate = (val: any) => {
        if (typeof val !== 'number') {
            return undefined;
        }
        return val;
    }
}

export class Str implements Parameter<string> {
    _value: string;
    get value(): string {
        return this._value;
    }
    tryParseAndSet = (str: string) => {
        this._value = str;
        return true;
    }
    validate = (val: any) => {
        if (typeof val !== 'string') {
            return undefined;
        }
        return val;
    }
}

export class Arr<V, T extends Validator<V>> implements Parameter<V[]> {
    _value: V[];
    _validator: T;
    constructor(validator: T) {
        this._validator = validator;
    }
    get value(): V[] {
        return this._value;
    }

    tryParseAndSet = (str: string) => {
        const json = JSON.parse(str);
        const res = this.validate(json);
        if (res === undefined) {
            return false;
        }
        this._value = res;
        return true;
    }

    validate = (val: any) => {
        if (!Array.isArray(val)) {
            return undefined;
        }
        return val.map(this._validator.validate).every(v => v !== undefined) ? val as V[] : undefined;
    }
}

export type ParameterProps<T> = {
    label: string,
    value: Parameter<T>
}

export type State<T> = {
    value: Parameter<T>,
    error: boolean
}

export class ParameterComponent<T> extends React.Component<ParameterProps<T>, State<T>> {
    label: string;
    constructor(prop: ParameterProps<T>) {
        super(prop);
        this.label = prop.label;
        this.state = {
            value: prop.value,
            error: false,
        }
    }

    onChange(event: ChangeEvent<HTMLInputElement>) {
        console.log(this)
        try {
            this.setState({
                value: this.state.value,
                error: !this.state.value.tryParseAndSet(event.target.value),
            })
        } catch {
            this.setState({
                value: this.state.value,
                error: true,
            })
        }
    }

    render(): React.ReactNode {
        return <div>{this.label}: <input onChange={(e) => this.onChange(e)}/> {this.state.error && "invalid value"}</div>
    }
        
}

// export const ParametersComponent = <T, >(object: Parameter<T>) => {
//     return <input onChange={object.tryParseAndSet}></input>
//     const c = new Arr(new Arr(new Num()))
//     console.log(c)
//     console.log(c.tryParseAndSet("[[1], [2], [3]]"))
//     console.log(c)
// }