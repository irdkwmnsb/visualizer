import { BubbleSortStarter } from "./visualizers/bubble-sort/start";
import { globalStore } from "./lib";
import { BubbleSortRender } from "./visualizers/bubble-sort/render";
import { useVisualizer } from "./lib/hooks";

const App = () => {
  const {curState, curEvent, events, start, next} = useVisualizer();
  return <div>
    <h1>Visualizer</h1>
    <BubbleSortStarter doStart={start} />
    <BubbleSortRender curState={curState} curEvent={curEvent}/>
    <button onClick={next}>Next</button>
  </div>;
};

export default App;
