import { BubbleSortStarter } from "./visualisers/bubble-sort/start";
import { globalStore } from "./lib";
import { BubbleSortRender } from "./visualisers/bubble-sort/render";

const App = () => {
  console.log("Rendering App", globalStore.curState, globalStore.curEvent);
  return <div>
    <h1>Visualiser</h1>
    <BubbleSortStarter doStart={(...args) => globalStore.start(...args)} />
    <BubbleSortRender curState={globalStore.curState} curEvent={globalStore.curEvent} key={globalStore.currentStep}/>
    <button onClick={() => globalStore.next()}>Next</button>
  </div>;
};

export default App;
