// js/treeMap.js

d3.csv("data/cleaned_bike_data.csv").then(function(data) {
  // Step 1: Aggregate ride counts by user type + rideable type
  const nested = d3.rollups(
    data,
    v => v.length,
    d => d.member_casual,
    d => d.rideable_type
  );

  // Step 2: Convert to hierarchical format
  const rootData = {
    name: "Rides",
    children: nested.map(([userType, types]) => ({
      name: userType,
      children: types.map(([bikeType, count]) => ({
        name: bikeType,
        value: count
      }))
    }))
  };

  const width = 800;
  const height = 400;

  const root = d3.hierarchy(rootData)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  d3.treemap()
    .size([width, height])
    .paddingInner(4)
    (root);

  const color = d3.scaleOrdinal()
    .domain(["member", "casual"])
    .range(["#00cca7", "#cc004b"]);

  const svg = d3.select("#treeMap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#treeMap")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const nodes = svg.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.parent.data.name))
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.data.name}</strong><br>User: ${d.parent.data.name}<br>Rides: ${d.data.value}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  nodes.append("text")
    .attr("x", 4)
    .attr("y", 16)
    .text(d => d.data.name)
    .style("font-size", "13px")
    .style("fill", "white");
});
