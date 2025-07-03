// js/lineChart.js

d3.csv("data/cleaned_bike_data.csv").then(function(data) {
  const parseMonth = d3.timeParse("%Y-%m");
  const monthFormat = d3.timeFormat("%b %Y");

  // Group data by member_casual + month
  const grouped = d3.rollups(
    data,
    v => v.length,
    d => d.member_casual,
    d => d.month
  );

  const seriesData = grouped.map(([userType, months]) => {
    const values = months.map(([month, count]) => ({
      month: parseMonth(month),
      count: count
    })).sort((a, b) => a.month - b.month);
    return { userType, values };
  });

  const margin = { top: 30, right: 20, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const allMonths = seriesData.flatMap(d => d.values.map(v => v.month));
  const allCounts = seriesData.flatMap(d => d.values.map(v => v.count));

  const x = d3.scaleTime()
    .domain(d3.extent(allMonths))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(allCounts)])
    .range([height, 0]);

  const xAxis = chartArea.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(monthFormat));

  const yAxis = chartArea.append("g")
    .call(d3.axisLeft(y));

  // Axis labels
  chartArea.append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + 40)
    .attr("y", height + 40)
    .text("Month");

  chartArea.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .text("Number of Rides");

  const line = d3.line()
    .x(d => x(d.month))
    .y(d => y(d.count));

  const color = d3.scaleOrdinal()
    .domain(["member", "casual"])
    .range(["#6600cc", "#00aacc"]);

  const tooltip = d3.select("#lineChart")
    .append("div")
    .attr("class", "tooltip");

  const lineGroups = {};

  seriesData.forEach(series => {
    const group = chartArea.append("g").attr("class", `line-${series.userType}`);

    // Line path
    group.append("path")
      .datum(series.values)
      .attr("fill", "none")
      .attr("stroke", color(series.userType))
      .attr("stroke-width", 2)
      .attr("d", line);

    // Dots
    group.selectAll("circle")
      .data(series.values)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.count))
      .attr("r", 4)
      .attr("fill", color(series.userType))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${series.userType}</strong><br>${monthFormat(d.month)}<br>Rides: ${d.count}`)
          .style("left", (event.offsetX + 15) + "px")
          .style("top", (event.offsetY - 40) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.offsetX + 15) + "px")
          .style("top", (event.offsetY - 40) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    lineGroups[series.userType] = group;
  });

  // ✅ Add Toggle Legend
  const legend = d3.select("#lineChart")
    .append("div")
    .attr("class", "legend")
    .style("margin-top", "10px");

  ["member", "casual"].forEach(type => {
    const label = legend.append("label").style("margin-right", "15px");
    label.append("input")
      .attr("type", "checkbox")
      .attr("checked", true)
      .attr("value", type)
      .on("change", function () {
        lineGroups[type].style("display", this.checked ? "block" : "none");
      });
    label.append("span")
      .text(" " + type.charAt(0).toUpperCase() + type.slice(1))
      .style("color", color(type));
  });

  // ✅ Zoom behavior
  const xOriginal = x.copy();
  const zoom = d3.zoom()
    .scaleExtent([1, 4])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(xOriginal);
      xAxis.call(d3.axisBottom(newX).tickFormat(monthFormat));

      for (const [userType, group] of Object.entries(lineGroups)) {
        const data = seriesData.find(s => s.userType === userType).values;
        group.select("path").attr("d", line.x(d => newX(d.month)));
        group.selectAll("circle").attr("cx", d => newX(d.month));
      }
    });

  svg.call(zoom);
});
