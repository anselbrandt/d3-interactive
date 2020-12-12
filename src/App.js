import React from "react";
import "./App.css";
import MultilineChart from "./MultilineChart";
import CanvasChart from "./CanvasChart";
import Chart from "./Chart";

function App() {
  return (
    <div className="App">
      <div>
        <MultilineChart />
      </div>
      <div>
        <Chart />
      </div>
      <div>
        <CanvasChart />
      </div>
    </div>
  );
}

export default App;
