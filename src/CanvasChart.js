import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { select, line, scaleLinear, pointers } from "d3";
import useGetViewport from "./useGetViewport";
import { data } from "./data";

function CanvasChart() {
  const { width: viewportWidth, height: viewportHeight } = useGetViewport();
  const width = viewportWidth * 0.5;
  const height = viewportHeight * 0.5;
  const canvasRef = useRef();
  const [isDown, setIsDown] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [position, setPosition] = useState();
  const [pointer, setPointer] = useState();
  const [isClicked, setIsClicked] = useState(false);
  const [values, setValues] = useState();

  useEffect(() => {
    const color = "steelblue";
    const axisColor = "gray";

    const canvas = canvasRef.current;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    const context = canvas.getContext("2d");
    context.scale(scale, scale);

    const xValues = data.map((value) => value[0]);
    const yValues = data.map((value) => value[1]);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const domain = [xMin, xMax];
    const range = [yMin, yMax];

    const getValue = (value) => {
      switch (true) {
        case value > xMax:
          return xMax;
        case value > 1000000:
          return `${(value / 1000000).toFixed(2)}M`;
        case value > 1000:
          return `${(value / 1000).toFixed(0)},000`;
        case value > xMin:
          return value.toFixed(0);
        default:
          return 0;
      }
    };

    const xScale = scaleLinear().domain(domain).range([0, width]);
    const yScale = scaleLinear().domain(range).range([height, 0]);

    const xAxis = () => {
      context.beginPath();
      context.moveTo(0, height);
      context.lineTo(width, height);
      context.lineWidth = 1;
      context.strokeStyle = axisColor;
      context.stroke();
    };

    const yAxis = () => {
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, height);
      context.lineWidth = 1;
      context.strokeStyle = axisColor;
      context.stroke();
    };

    const getLine = line()
      .x((value) => xScale(value[0]))
      .y((value) => yScale(value[1]))
      .context(context);

    const withinBounds = (x, y) => {
      switch (true) {
        case x < 0:
          return false;
        case x > width:
          return false;
        case y < 0:
          return false;
        case y > height:
          return false;
        default:
          return true;
      }
    };

    const onEvent = (event) => {
      event.preventDefault();
      const type = event.type;

      if (pointers(event) && pointers(event)[0]) {
        const [x, y] = pointers(event)[0];

        if (["mouseenter", "pointerenter"].includes(type)) {
          setIsEntered(true);
          setIsClicked(false);
        }
        if (["mousedown", "pointerdown", "touchstart"].includes(type))
          setIsDown(true);
        if (type === "click") {
          setIsClicked((prev) => !prev);
          setPosition(pointers(event)[0]);
          setValues([getValue(xScale.invert(x)), getValue(yScale.invert(y))]);
        }
        if (["mousemove", "touchmove", "pointermove"].includes(type)) {
          if (withinBounds(x, y)) {
            setPointer(pointers(event)[0]);
            if (!isClicked) {
              setPosition(pointers(event)[0]);
              setValues([
                getValue(xScale.invert(x)),
                getValue(yScale.invert(y)),
              ]);
            }
          }
        }

        if (["mouseup", "pointerup", "touchend"].includes(type))
          setIsDown(false);
        if (["mouseout", "pointerout"].includes(type)) {
          setIsEntered(false);
          setIsDown(false);
          setPointer(null);
        }
      }
    };

    select(context.canvas).on(
      "click " +
        "mouseenter mouseout mousedown mouseup mousemove " +
        "touchstart touchend touchmove " +
        "pointerenter pointerout pointerup pointerdown pointermove",
      onEvent
    );

    const circles = [
      {
        x: position ? position[0] : 0,
        y: position ? position[1] : 0,
        color: color,
        radius: 2.5,
      },
    ];

    const lines = [
      {
        x1: 0,
        y1: pointer ? pointer[1] : 0,
        x2: width,
        y2: pointer ? pointer[1] : 0,
        color: color,
      },
      {
        x1: pointer ? pointer[0] : 0,
        y1: 0,
        x2: pointer ? pointer[0] : 0,
        y2: height,
        color: color,
      },
    ];

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      xAxis();
      yAxis();

      context.beginPath();
      getLine(data);
      context.lineWidth = 1.5;
      context.strokeStyle = isEntered ? "#ddd" : color;
      context.stroke();

      if (isEntered) {
        for (const { x, y, color, radius } of circles) {
          context.beginPath();
          context.moveTo(x + radius, y);
          context.arc(x, y, radius, 0, 2 * Math.PI);
          context.fillStyle = color;
          context.fill();
        }

        for (const { x1, y1, x2, y2, color } of lines) {
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.lineWidth = 1;
          context.strokeStyle = color;
          context.stroke();
        }
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    return () => cancelAnimationFrame(draw);
  }, [
    width,
    height,
    canvasRef,
    pointer,
    position,
    isEntered,
    isDown,
    isClicked,
  ]);

  return (
    <div className="App">
      <div className="Title">Canvas Chart</div>
      <div className="SubTitle" style={{ marginBottom: 30 }}>
        More on{" "}
        <a href="https://observablehq.com/@d3/multitouch">
          Multitouch done right
        </a>
      </div>
      <canvas ref={canvasRef} />
      <div style={{ marginTop: 30 }}>
        {values ? `${values[0]}, ${values[1]}` : "0, 0"}
      </div>
    </div>
  );
}

export default CanvasChart;
