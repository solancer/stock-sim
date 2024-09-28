import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const colors = d3.schemeCategory10;

const StockChart = ({ data }) => {
  const svgRef = useRef();
  const [chartData, setChartData] = useState({});
  const margin = { top: 50, right: 80, bottom: 70, left: 70 };
  const transitionDuration = 750; // Transition duration for smooth update

  useEffect(() => {
    // Merge new data with existing data, ensuring no duplicates
    setChartData((prevData) => {
      const newData = { ...prevData };
      Object.entries(data).forEach(([stock, stockData]) => {
        // Only append new data points that don't already exist
        const existingData = newData[stock] || [];
        const updatedData = [...existingData, ...stockData.filter(d => !existingData.some(e => e.time === d.time))];
        newData[stock] = updatedData;
      });
      return newData;
    });
  }, [data]);

  useEffect(() => {
    if (Object.keys(chartData).length === 0) return;

    const svgElement = svgRef.current;
    const containerWidth = svgElement.parentElement.clientWidth || 800;
    const svgWidth = containerWidth;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Remove previous SVG content
    d3.select(svgElement).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgElement).attr('width', svgWidth).attr('height', svgHeight);

    // Create chart group
    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const allData = Object.entries(chartData).flatMap(([stock, stockData]) =>
      stockData.map((d) => ({ ...d, stock }))
    );

    // Ensure data is valid
    const validData = allData.filter((d) => {
      const timeValid = d.time && !isNaN(new Date(d.time).getTime());
      const priceValid = d.price != null && !isNaN(d.price);
      return timeValid && priceValid;
    });

    if (validData.length === 0) return;

    // Set up X scale
    const xScale = d3.scaleTime().range([0, width]);
    const xExtent = d3.extent(validData, (d) => new Date(d.time));
    xScale.domain(xExtent);

    // Set up Y scale (Shared Y scale)
    const yExtentGlobal = d3.extent(validData, (d) => d.price);
    const yScale = d3.scaleLinear()
      .domain([yExtentGlobal[0] - (yExtentGlobal[1] - yExtentGlobal[0]) * 0.1, yExtentGlobal[1] + (yExtentGlobal[1] - yExtentGlobal[0]) * 0.1])
      .range([height, 0]);

    // Add X axis with grid lines
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%H:%M:%S'));
    const xAxisGrid = d3.axisBottom(xScale).ticks(5).tickSize(-height).tickFormat('');

    chartGroup
      .append('g')
      .attr('class', 'x-axis-grid')
      .attr('transform', `translate(0,${height})`)
      .call(xAxisGrid)
      .selectAll('line')
      .attr('stroke', '#e0e0e0'); // Light gray gridlines for X-axis

    chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add Y axis with grid lines (Single shared Y axis)
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `$${d.toFixed(2)}`);
    const yAxisGrid = d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat('');

    chartGroup
      .append('g')
      .attr('class', 'y-axis-grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#e0e0e0');

    chartGroup
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Draw lines for each stock with transitions
    Object.entries(chartData).forEach(([stock, stockData], index) => {
      const color = colors[index % colors.length];

      const lineGenerator = d3
        .line()
        .x((d) => xScale(new Date(d.time)))
        .y((d) => yScale(d.price))
        .curve(d3.curveMonotoneX);

      const stockLine = chartGroup
        .selectAll(`.line-${stock}`)
        .data([stockData]);

      // Enter new line
      stockLine
        .enter()
        .append('path')
        .attr('class', `stock-line line-${stock}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator)
        .merge(stockLine)
        .transition() // Add transition for smooth update
        .duration(transitionDuration)
        .attr('d', lineGenerator);

      // Exit old lines
      stockLine.exit().remove();
    });

    // Add legend
    const legend = chartGroup
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0,${-margin.top / 2})`);

    Object.keys(chartData).forEach((stock, index) => {
      const legendRow = legend
        .append('g')
        .attr('class', `legend-item legend-${stock}`)
        .attr('transform', `translate(${index * 120}, 0)`)
        .style('cursor', 'pointer')
        .on('click', function () {
          const isActive = !d3.select(this).classed('inactive');
          d3.select(this).classed('inactive', isActive);
          chartGroup.selectAll(`.line-${stock}`).style('opacity', isActive ? 0 : 1);
        });

      legendRow
        .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colors[index % colors.length]);

      legendRow
        .append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(stock)
        .attr('fill', '#000')
        .attr('font-size', '12px');
    });
  }, [chartData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>
    </div>
  );
};

export default StockChart;
