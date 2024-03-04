import { bind, here } from "."
import { Tape } from "./tape"

type TapeMove = ">" | "^" | "<"

type Rule = {
    curState: string,
    curTape: string,
    newState: string,
    newTape: string,
    action: TapeMove,
    lineNumber: number,
    fullString: string
}

type Program = {
    start: string,
    accept: string,
    reject: string,
    rules: Rule[]
}

const parseProgram = (program: string): Program => {
    const lines = program.split(/\r?\n/)
    let lineNumber = 0
    let start, accept, reject
    while(lineNumber < lines.length) { // reading header
        const match = lines[lineNumber].toLowerCase().match(/(start|accept|reject|blank): (.+)/)
        console.log(match)
        if (match === null) {
            break
        }
        const [_, name, value] = match
        if (name === "start") {
            start = value
        } else if (name === "accept") {
            accept = value
        } else if (name === "reject") {
            reject = value
        } else {
            // ignore blank.
        }
        lineNumber++
    }
    
    // reading rules.
    const rules: Rule[] = []
    while (lineNumber < lines.length) {
        const match = lines[lineNumber].toLowerCase().match(/([^ ]+) ([^ ]+) -> ([^ ]+) ([^ ]+) (\^|<|>)/)
        if (match === null) {
            throw new Error("Cannot parse line " + lineNumber + ": " + lines[lineNumber])
        }

        const [_, curState, curTape, newState, newTape, action] = match
        rules.push({
            curState,
            curTape,
            newState,
            newTape,
            action,
            lineNumber,
            fullString: lines[lineNumber]
        } as Rule)
        lineNumber++
    }

    return {
        start,
        accept,
        reject,
        rules
    }
}

type InnerState = {
    status: "running" | "halted",
    description: string
    state: string,
    curPosition: number,
    curStep: number
}

export const turingMachine = async (program: Readonly<string>, startTape: Readonly<Tape>, maxSteps: number = 10_000): Promise<Tape> => {
    console.log("start")
    const parsed = parseProgram(program)
    console.log("parsed", parsed)
    const tapeCopy = startTape.copy()
    const state: InnerState = {
        status: "running",
        description: "Machine is running",
        state: parsed.start,
        curPosition: 0,
        curStep: 0
    }
    bind("machineState", state)
    bind("tape", tapeCopy)
    for (;;) {
        if (state.curStep > maxSteps) {
            state.status = "halted"
            state.description = "Maximum number of steps reached"
            break
        } else if (state.state === parsed.accept) {
            state.status = "halted"
            state.description = "Machine accepted the input tape."
            break
        } else if (state.state === parsed.reject) {
            state.status = "halted"
            state.description = "Machine rejected the input tape."
            break
        }
        let matchingRule: Rule | null = null
        for(const rule of parsed.rules) {
            if (state.state === rule.curState && (tapeCopy.get(state.curPosition) ?? "_") === rule.curTape) {
                if (matchingRule !== null) {
                    throw new Error("Two rules match this state.")
                }
                matchingRule = rule
            }
        }
        await here("fetch", matchingRule)
        if(matchingRule === null) {
            state.status = "halted"
            state.state = parsed.reject
            state.description = "Machine couldn't find rule for this state, so it rejected"
            break
        }
        // execute the rule
        tapeCopy.set(state.curPosition, matchingRule.newTape === "_" ? undefined : matchingRule.newTape)
        state.state = matchingRule.newState
        if (matchingRule.action === ">") {
            state.curPosition++
        } else if (matchingRule.action === "<") {
            state.curPosition--
        }
        await here("execute", matchingRule)
    }
    await here("done")
    return tapeCopy
}

export type TuringMachineState = {
    tape: Tape,
    machineState: InnerState
}

export type TuringMachineEvent = {
    name: "fetch",
    args: [Rule]
} | {
    name: "execute",
    args: [Rule]
} | {
    name: "done",
    args: []
}

export type TuringMachineArguments = [Readonly<string>, Readonly<Tape>, number];