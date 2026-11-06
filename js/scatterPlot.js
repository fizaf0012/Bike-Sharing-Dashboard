// js/scatterPlot.js
// Changes from the original:
//  1. Reads data/rides_sample.csv: 10,000 rides chosen at random from the whole dataset (the original took
//     the FIRST 10,000 rows of the big file, which only covers the earliest days).
//  2. Mouse-wheel zoom no longer hijacks page scrolling (that is what cropped the chart to hours 6-23).
//     Hold Ctrl and scroll to zoom instead.
//  3. Points are clipped to the plot area when zoomed.
//  4. Shows a clear message if the CSV fails to load or contains no valid rows.

let fullScatterData = [];
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

function showScatterMessage(text) {
  const box = d3.select("#scatterPlot");
  box.selectAll("*").remove();
  box.append("p")
    .style("padding", "40px 20px")
    .style("color", "#b00020")
    .text(text);
}

function drawScatterPlot(filter = "all") {
  const svgContainer = d3.select("#scatterPlot");
  svgContainer.selectAll("*").remove(); // Clear previous chart and tooltip

  const data = filter === "all"
    ? fullScatterData
    : fullScatterData.filter(d => d.rideable_type === filter);

  if (!data.length) {
    showScatterMessage("No rides to show for this selection. If this appears for every selection, " +
      "check that data/rides_sample.csv exists and has hour, duration_min and rideable_type columns.");
    return;
  }

  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.append("defs")
    .append("clipPath")
    .attr("id", "scatter-clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 23]).range([0, width]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.duration_min)])
    .range([height, 0]);

  const xAxis = chartArea.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(24));

  chartArea.append("g").call(d3.axisLeft(y));

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

  // Draw points inside a clipped layer so they stay within the plot when zoomed
  const pointLayer = chartArea.append("g").attr("clip-path", "url(#scatter-clip)");

  const points = pointLayer.selectAll(".point")
    .data(data.filter(d => symbolMap[d.rideable_type]))
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

  // Zoom support: Ctrl + scroll to zoom, drag to pan (plain scrolling still scrolls the page)
  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .filter(event => (event.type !== "wheel" || event.ctrlKey) && !event.button)
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(x);
      xAxis.call(d3.axisBottom(newX).ticks(24));
      points.attr("transform", d => `translate(${newX(d.hour)}, ${y(d.duration_min)})`);
    });

  svg.call(zoom);
}

// Initial load: data/rides_sample.csv holds 10,000 randomly chosen rides (0-120 min) drawn from the
// whole period, created by build_dashboard_data.py.
d3.csv("data/rides_sample.csv").then(data => {
  data.forEach(d => {
    d.hour = +d.hour;
    d.duration_min = +d.duration_min;
  });

  fullScatterData = data.filter(d => Number.isFinite(d.hour) && d.duration_min > 0 && d.duration_min <= 120);

  drawScatterPlot("all");
}).catch(err => {
  console.error("Could not load data/rides_sample.csv", err);
  showScatterMessage("Could not load data/rides_sample.csv. See the browser console for details.");
});

// Dropdown filter
document.getElementById("bikeTypeFilter").addEventListener("change", function () {
  drawScatterPlot(this.value);
});
