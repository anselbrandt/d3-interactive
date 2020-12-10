import React from "react";
import "./App.css";
// import MultilineChart from "./MultilineChart";
import SvgChart from "./SvgChart";
// import CanvasChart from "./CanvasChart";

function App() {
  return (
    <div className="App">
      <div className="Title">React D3 Charts</div>
      <div className="SubTitle" style={{ marginBottom: 30 }}>
        SVG, Canvas and Multiline
      </div>
      <div style={{ margin: 30 }}>{/* <MultilineChart /> */}</div>
      <div style={{ margin: 30 }}>
        <SvgChart />
      </div>
      <div style={{ margin: 30 }}>{/* <CanvasChart /> */}</div>
    </div>
  );
}

export default App;
