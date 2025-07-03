// js/scatterPlot.js

let fullScatterData;
const legendContainer = d3.select("#scatterLegend");
legendContainer.selectAll("*").remove(); // Clear previous legend

const legendItems = [
  { type: "classic_bike", label: "Classic Bike", color: "#4CAF50", shape: d3.symbolCircle },
  { type: "electric_bike", label: "Electric Bike", color: "#2196F3", shape: d3.symbolTriangle },
  { type: "docked_bike", label: "Docked Bike", color: "#FFC107", shape: d3.symbolDiamond }
];

const legendSVG = legendContainer.append("svg")
  .attr("width", 120)
  .attr("height", legendItems.length * 30);

legendItems.forEach((item, i) => {
  const g = legendSVG.append("g").attr("transform", `translate(10, ${i * 30 + 10})`);

  const symbol = d3.symbol().type(item.shape).size(100);

  g.append("path")
    .attr("d", symbol)
    .attr("transform", `translate(10,10)`)
    .attr("fill", item.color)
    .attr("stroke", "#333");

  g.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text(item.label)
    .style("font-size", "13px");
});
function drawScatterPlot(filter = "all") {
  const svgContainer = d3.select("#scatterPlot");
  svgContainer.selectAll("*").remove(); // Clear previous chart and tooltip

  const data = filter === "all"
    ? fullScatterData
    : fullScatterData.filter(d => d.rideable_type === filter);

  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 23]).range([0, width]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.duration_min)])
    .range([height, 0]);

  const xAxis = chartArea.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(24));

  const yAxis = chartArea.append("g").call(d3.axisLeft(y));

  // Axis labels
  chartArea.append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + 30)
    .attr("y", height + 40)
    .text("Hour of Day");

  chartArea.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .text("Ride Duration (min)");

  const tooltip = svgContainer.append("div").attr("class", "tooltip");

  // Color and shape mapping
  const color = {
    classic_bike: "#4CAF50",
    electric_bike: "#2196F3",
    docked_bike: "#FFC107"
  };

  const symbolMap = {
    classic_bike: d3.symbol().type(d3.symbolCircle).size(50),
    electric_bike: d3.symbol().type(d3.symbolTriangle).size(50),
    docked_bike: d3.symbol().type(d3.symbolDiamond).size(50)
  };

  const points = chartArea.selectAll(".point")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "point")
    .attr("transform", d => `translate(${x(d.hour)}, ${y(d.duration_min)})`)
    .attr("d", d => symbolMap[d.rideable_type]())
    .attr("fill", d => color[d.rideable_type])
    .attr("stroke", "#333")
    .attr("opacity", 0.7)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.rideable_type.replace("_", " ")}</strong><br>Hour: ${d.hour}<br>Duration: ${Math.round(d.duration_min)} min`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Zoom support
  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(x);
      xAxis.call(d3.axisBottom(newX).ticks(24));
      points.attr("transform", d => `translate(${newX(d.hour)}, ${y(d.duration_min)})`);
    });

  svg.call(zoom);
}

// Initial load
d3.csv("data/cleaned_bike_data.csv").then(data => {
  data.forEach(d => {
    d.hour = +d.hour;
    d.duration_min = +d.duration_min;
  });

  // Limit outliers
  fullScatterData = data.filter(d => d.duration_min > 0 && d.duration_min <= 120).slice(0, 10000);
  drawScatterPlot("all");
});

// Dropdown filter
document.getElementById("bikeTypeFilter").addEventListener("change", function () {
  drawScatterPlot(this.value);
});
