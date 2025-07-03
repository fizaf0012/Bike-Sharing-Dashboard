// js/pieChart.js

d3.csv("data/cleaned_bike_data.csv").then(function(data) {
  const userCounts = d3.rollup(data, v => v.length, d => d.member_casual);
  const pieData = Array.from(userCounts, ([type, count]) => ({ type, count }));

  const width = 400, height = 400, margin = 40;
  const radius = Math.min(width, height) / 2 - margin;

  const svg = d3.select("#pieChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.type))
    .range(["#4CAF50", "#2196F3"]);

  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

  // Tooltip
  // Tooltip
const tooltip = d3.select("#pieChart")
  .append("div")
  .attr("class", "tooltip");

svg.selectAll('path')
  .data(pie(pieData))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', d => color(d.data.type))
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .on("mouseover", function(event, d) {
    d3.select(this).transition().duration(200).attr("d", arcHover);

    const total = d3.sum(pieData.map(d => d.count));
    const percent = ((d.data.count / total) * 100).toFixed(1);

    tooltip
      .style("opacity", 1)
      .html(`<strong>${d.data.type}</strong><br>Rides: ${d.data.count}<br>${percent}%`)
      .style("left", (event.offsetX + 15) + "px")
      .style("top", (event.offsetY - 40) + "px");
  })
  .on("mousemove", function(event) {
    tooltip
      const [x, y] = d3.pointer(event, d3.select("#pieChart").node());

tooltip
  .style("left", (x + 15) + "px")
  .style("top", (y - 40) + "px");
  })
  .on("mouseout", function() {
    d3.select(this).transition().duration(200).attr("d", arc);
    tooltip.style("opacity", 0);
  });

});
