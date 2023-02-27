import { BubbleSortStarter } from "./visualizers/bubble-sort/start";
import { globalStore } from "./lib";
import { BubbleSortRender } from "./visualizers/bubble-sort/render";
import { useVisualizer } from "./lib/hooks";
import { useState } from "react";

const App = () => {
  const {curState, curEvent, events, start, next} = useVisualizer();
  const [eventOverride, setEventOverride] = useState<number | undefined>(undefined);
  const curEventOverride = eventOverride !== undefined ? events[eventOverride] : curEvent;
  const curStateOverride = eventOverride !== undefined ? events[eventOverride].state : curState;
  const onNextClick = () => {
    if (eventOverride !== undefined && eventOverride < events.length - 1) {
      setEventOverride(eventOverride + 1);
    } else {
      next();
      setEventOverride(undefined);
    }
  };
  return <div>
    <h1>Visualizer</h1>
    <BubbleSortStarter doStart={start}/>
    <BubbleSortRender curState={curStateOverride} curEvent={curEventOverride}/>
    <div>
      {events && events.map((x, i) => {
        return <div key={i}>
          {i === eventOverride ? "OVERRIDE" : ""}
          {i === globalStore.currentStep - 1 ? "CUR" : ""}
          {JSON.stringify(x)}
          <button onClick={() => setEventOverride(i)}>Override</button>
          </div>;
      })}
    </div>
    <button onClick={onNextClick}>Next</button>
  </div>;
};

export default App;
