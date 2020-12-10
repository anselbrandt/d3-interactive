import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { select, line, axisBottom, axisLeft, scaleLinear, pointers } from "d3";
import useGetViewport from "./useGetViewport";
import { data } from "./data";

function SvgChart() {
  const { width: viewportWidth, height: viewportHeight } = useGetViewport();
  const width = viewportWidth * 0.5;
  const height = viewportHeight * 0.5;
  const svgRef = useRef();
  const [values, setValues] = useState();

  useEffect(() => {
    const axisColor = "dimgray";
    const xTicks = 5;
    const yTicks = 3;

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

    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height})`)
        .attr("color", axisColor)
        .call(axisBottom(xScale).ticks(xTicks));

    const yAxis = (g) =>
      g.attr("color", axisColor).call(axisLeft(yScale).ticks(yTicks));

    const getLine = line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    const chart = () => {
      const svg = select(svgRef.current);
      svg.selectAll("g").remove();
      svg.attr("width", `${width}px`).attr("height", `${height}px`);

      const xRule = svg
        .append("g")
        .attr("stroke-width", 1)
        .attr("display", "none");
      xRule
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);
      const yRule = svg
        .append("g")
        .attr("stroke-width", 1)
        .attr("display", "none");
      yRule
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0);

      const dot = svg.append("g").attr("display", "none");
      dot.append("circle").attr("r", 2.5);
      dot
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);

      const entered = () => {
        console.log("entered");
        svg
          .selectAll(".line")
          .style("mix-blend-mode", null)
          .attr("stroke", "#ddd");
        dot.attr("display", null);
        xRule.attr("display", null).attr("stroke", "steelblue");
        yRule.attr("display", null).attr("stroke", "steelblue");
      };

      const left = () => {
        console.log("left");
        svg
          .selectAll(".line")
          .style("mix-blend-mode", "multiply")
          .attr("stroke", null);
        dot.attr("display", "none");
        xRule.attr("display", "none");
        yRule.attr("display", "none");
      };

      const moved = (event) => {
        event.preventDefault();
        const cursorPosition = pointers(event)[0];
        const [x, y] = cursorPosition;
        setValues([getValue(xScale.invert(x)), getValue(yScale.invert(y))]);
        dot.attr("transform", `translate(${x},${y})`);
        const label = `${x.toFixed(0)}, ${y.toFixed(0)}`;
        dot.select("text").text(label);
        xRule.attr("transform", `translate(${x},0)`);
        yRule.attr("transform", `translate(0,${y})`);
      };

      const rect = (g) =>
        g
          .append("rect")
          .attr("fill", "transparent")
          .attr("width", width)
          .attr("height", height)
          .on("mousemove", moved)
          .on("mouseenter", entered)
          .on("mouseleave", left);

      svg.append("g").call(xAxis);
      svg.append("g").call(yAxis);
      svg.append("g").call(rect);

      const path = () => {
        svg
          .append("g")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .selectAll("path")
          .data([data])
          .join("path")
          .attr("class", "line")
          .style("mix-blend-mode", "multiply")
          .attr("d", (d) => getLine(d))
          .attr("pointer-events", "none");
      };

      svg.call(path);
    };
    chart();
  }, [width, height, svgRef]);

  return (
    <div className="App">
      <div className="Title">SVG Chart</div>
      <div className="SubTitle" style={{ marginBottom: 30 }}>
        More on{" "}
        <a href="https://observablehq.com/@d3/multitouch">
          Multitouch done right
        </a>
      </div>
      <svg ref={svgRef} overflow="visible">
        <g className="xAxis" />
        <g className="yAxis" />
      </svg>
      <div style={{ marginTop: 30 }}>
        {values ? `${values[0]}, ${values[1]}` : "0, 0"}
      </div>
    </div>
  );
}

export default SvgChart;
