# 🚴‍♀️ Bike Sharing Interactive Dashboard

An interactive data visualization dashboard built with **D3.js**, showcasing insights from bike sharing usage data, including ride trends, bike types, and user behaviors. 

---

## 📊 Features

This dashboard allows users to explore the dataset using the following interactive charts:

### 1. 📈 Line Chart — *Monthly Ride Volume*
- Shows ride counts per month
- Filters by user type: **Member** or **Casual**
- Hover tooltips with ride counts
- Zoomable X-axis
- Toggle lines visibility with checkboxes

### 2. 📊 Bar Chart — *Bike Type Distribution*
- Visualizes counts of **classic**, **electric**, and **docked** bikes
- Dropdown to filter by **Member**, **Casual**, or **All**
- Hover tooltips with counts
- Responsive and animated bars

### 3. 🔵 Scatter Plot — *Ride Duration vs Hour of Day*
- Compares ride duration by hour
- Filters by bike type
- Color-coded and shape-coded per bike type
- Zoomable X-axis
- Detailed tooltips on hover
- Shape legend on the right

### 4. 🥧 Pie Chart — *User Type Distribution*
- Proportions of Member vs Casual users
- Hover tooltips with counts and percentage
- Smooth hover expand effect
- Shared tooltip style with other charts

### 5. 🧱 Tree Map — *(Optional)* Ride Breakdown
- Ride breakdown by **user type** and **bike type**
- Area shows ride volume
- Interactive tooltip on hover
- Color-coded by user category

---

## 📂 Folder Structure

```bash
├── index.html
├── css/
│   └── style.css
├── data/
│   └── cleaned_bike_data.csv
├── js/
│   ├── utils.js
│   ├── lineChart.js
│   ├── barChart.js
│   ├── scatterPlot.js
│   ├── pieChart.js
│   └── treeMap.js
└── README.md
