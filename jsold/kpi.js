// js/kpi.js

d3.csv("data/cleaned_bike_data.csv").then(function(data) {
  const totalRides = data.length;
  const memberCount = data.filter(d => d.member_casual === "member").length;
  const casualCount = data.filter(d => d.member_casual === "casual").length;
  const avgDuration = d3.mean(data, d => +d.duration_min).toFixed(1);

  const bikeCount = d3.rollup(data, v => v.length, d => d.rideable_type);
  const topBike = Array.from(bikeCount).sort((a, b) => b[1] - a[1])[0][0];

  const monthCount = d3.rollup(data, v => v.length, d => d.month);
  const topMonth = Array.from(monthCount).sort((a, b) => b[1] - a[1])[0][0];

  const container = d3.select("#kpiCards");

  // Total Rides
  const card1 = container.append("div").attr("class", "kpi-card");
 card1.append("div").attr("class", "kpi-icon").html('<i class="fas fa-bicycle"></i>');
  card1.append("div").attr("class", "kpi-value").text(totalRides.toLocaleString());
  card1.append("div").attr("class", "kpi-label").text("Total Rides");

  // Members vs Casuals - Pie style
  const card2 = container.append("div").attr("class", "kpi-card");
card2.append("div").attr("class", "kpi-icon").html('<i class="fas fa-users"></i>');
  card2.append("div").attr("class", "kpi-pie");
  card2.append("div").attr("class", "kpi-label").text(`Members: ${memberCount}, Casuals: ${casualCount}`);

  // Avg Duration - Speedometer style
const card3 = container.append("div").attr("class", "kpi-card");
card3.append("div").attr("class", "kpi-icon").html('<i class="fas fa-stopwatch"></i>');
card3.append("div").attr("class", "kpi-value").text(`${avgDuration} min`);
card3.append("div").attr("class", "kpi-label").text("Avg. Ride Duration");

// Speedometer SVG
const gaugeWidth = 120;
const gaugeHeight = 70;
const innerRadius = 30;
const outerRadius = 40;
const fullAngle = Math.PI; // Semi-circle

const gauge = card3.append("svg")
  .attr("width", gaugeWidth)
  .attr("height", gaugeHeight)
  .append("g")
  .attr("transform", `translate(${gaugeWidth / 2}, ${gaugeHeight})`);

// Grey background arc (full 60 mins)
const bgArc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .startAngle(-Math.PI / 2)
  .endAngle(Math.PI / 2); // 180 degrees

gauge.append("path")
  .attr("d", bgArc)
  .attr("fill", "#ddd");

// Filled arc based on avgDuration (scale it to 60 max)
const percentage = Math.min(+avgDuration / 60, 1); // max cap at 60
const endAngle = (-Math.PI / 2) + (Math.PI * percentage);

const filledArc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .startAngle(-Math.PI / 2)
  .endAngle(endAngle);

gauge.append("path")
  .attr("d", filledArc)
  .attr("fill", "#00b894");

  // Top Bike Type with text + mini bar chart
const card4 = container.append("div").attr("class", "kpi-card");

// Icon
card4.append("div").attr("class", "kpi-icon").html('<i class="fas fa-person-biking"></i>');

// Top Bike Text
card4.append("div").attr("class", "kpi-value").text(topBike.replace("_", " ").replace("bike", "Bike"));

// Label
card4.append("div").attr("class", "kpi-label").text("Most Used Bike Type");

// Data prep
const bikeData = Array.from(bikeCount, ([type, count]) => ({ type, count }));
const maxBike = d3.max(bikeData, d => d.count);

// SVG for mini bar chart
const miniBarWidth = 160;
const miniBarHeight = 80;

const svg = card4.append("svg")
  .attr("width", miniBarWidth)
  .attr("height", miniBarHeight)
  .style("margin-top", "10px");

const x = d3.scaleBand()
  .domain(bikeData.map(d => d.type))
  .range([0, miniBarWidth])
  .padding(0.3);

const y = d3.scaleLinear()
  .domain([0, maxBike])
  .range([miniBarHeight - 20, 10]);

// Bars
svg.selectAll("rect")
  .data(bikeData)
  .enter()
  .append("rect")
  .attr("x", d => x(d.type))
  .attr("y", d => y(d.count))
  .attr("width", x.bandwidth())
  .attr("height", d => miniBarHeight - 20 - y(d.count))
  .attr("fill", d => d.type === topBike ? "#00b894" : "#ccc")
  .attr("rx", 3);

// Labels
svg.selectAll("text")
  .data(bikeData)
  .enter()
  .append("text")
  .attr("x", d => x(d.type) + x.bandwidth() / 2)
  .attr("y", miniBarHeight - 5)
  .attr("text-anchor", "middle")
  .attr("font-size", "10px")
  .attr("fill", "#333")
  .text(d => d.type.replace("_", " "));

  // Busiest Month
  const card5 = container.append("div").attr("class", "kpi-card");
  card5.append("div").attr("class", "kpi-icon").html('<i class="fas fa-calendar-alt"></i>');
  card5.append("div").attr("class", "kpi-value").text(topMonth);
  card5.append("div").attr("class", "kpi-label").text("Busiest Month");
});
