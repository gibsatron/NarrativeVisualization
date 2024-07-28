const width = 960;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 70 };

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightgrey");

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

d3.csv('./athlete_events.csv').then(data => {
    // Preprocess data
    const medalData = preprocessData(data);

    // Initialize the visualization
    initVisualization(medalData);
});

function preprocessData(data) {
    const countryYearData = {};

    data.forEach(d => {
        if (!countryYearData[d.Team]) {
            countryYearData[d.Team] = {};
        }
        if (!countryYearData[d.Team][d.Year]) {
            countryYearData[d.Team][d.Year] = { participants: 0, golds: 0, totalMedals: 0 };
        }
        countryYearData[d.Team][d.Year].participants += 1;
        if (d.Medal === "Gold") {
            countryYearData[d.Team][d.Year].golds += 1;
        }
        if (d.Medal !== "NA") {
            countryYearData[d.Team][d.Year].totalMedals += 1;
        }
    });

    const medalData = [];
    for (const country in countryYearData) {
        for (const year in countryYearData[country]) {
            medalData.push({
                country,
                year: +year,
                participants: countryYearData[country][year].participants,
                golds: countryYearData[country][year].golds,
                totalMedals: countryYearData[country][year].totalMedals,
                medalEfficiency: countryYearData[country][year].totalMedals / countryYearData[country][year].participants
            });
        }
    }

    return medalData;
}

function initVisualization(data) {
    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const yearInput = d3.select("#year");
    const yearLabel = d3.select("#year-label");

    yearInput.on("input", function() {
        const selectedYear = +this.value;
        yearLabel.text(selectedYear);
        updateVisualization(data, selectedYear, xScale, yScale, xAxis, yAxis);
    });

    updateVisualization(data, +yearInput.property("value"), xScale, yScale, xAxis, yAxis);
}

function updateVisualization(data, year, xScale, yScale, xAxis, yAxis) {
    const filteredData = data.filter(d => d.year === year);

    xScale.domain([0, d3.max(filteredData, d => d.participants)]);
    yScale.domain([0, d3.max(filteredData, d => d.golds)]);

    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .call(yAxis);

    const circles = svg.selectAll(".circle").data(filteredData, d => d.country);

    circles.exit().remove();

    circles.enter().append("circle")
        .attr("class", "circle")
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.golds))
        .attr("r", 5)
        .attr("fill", "blue")
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
                          Gold Medals: ${d.golds}<br>
                          Total Medals: ${d.totalMedals}<br>
                          Medal Efficiency: ${(d.medalEfficiency * 100).toFixed(2)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("visibility", "visible");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    circles
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.golds));

    // Annotations
    const usData = filteredData.find(d => d.country === "USA");
    if (usData) {
        svg.append("text")
            .attr("x", xScale(usData.participants))
            .attr("y", yScale(usData.golds) - 10)
            .attr("fill", "red")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(`USA: ${usData.totalMedals} Medals (${(usData.medalEfficiency * 100).toFixed(2)}%)`);
    }
}
