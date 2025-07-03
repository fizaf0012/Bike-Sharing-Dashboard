// js/barChart.js

function drawBarChart(userType = "all") {
  d3.csv("data/cleaned_bike_data.csv").then(function(data) {
    // Filter data if needed
    const filteredData = userType === "all" ? data : data.filter(d => d.member_casual === userType);

    // Aggregate counts by rideable_type
    const rideCounts = d3.rollup(
      filteredData,
      v => v.length,
      d => d.rideable_type
    );

    const barData = Array.from(rideCounts, ([type, count]) => ({
      type,
      count
    }));

    // Remove any existing chart
    d3.select("#barChart svg").remove();
    d3.select("#barChart .tooltip").remove();

    // Dimensions
    const margin = { top: 30, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#barChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(barData.map(d => d.type))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(barData, d => d.count)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("#barChart")
      .append("div")
      .attr("class", "tooltip");

    // Bars
    svg.selectAll("rect")
      .data(barData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .attr("fill", "#4CAF50")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`${d.type}<br>Count: ${d.count}`)
          .style("left", (event.offsetX + 15) + "px")
          .style("top", (event.offsetY - 40) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.offsetX + 15) + "px")
          .style("top", (event.offsetY - 40) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  });
}

// 🔄 Initial draw
drawBarChart();

// 🔁 Update on dropdown change
document.getElementById("userTypeFilter").addEventListener("change", function () {
  drawBarChart(this.value);
});
