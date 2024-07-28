const width = 960;
const height = 600;
const margin = { top: 70, right: 30, bottom: 70, left: 100 };

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")  
    .style("font-size", "24px") 
    .style("text-decoration", "underline")  
    .text("Gold Medals vs. Number of Participants");

svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom / 3})`)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Number of Participants");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 3)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Number of Gold Medals");

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
    const countries = [...new Set(data.map(d => d.country))].sort();
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const yearInput = d3.select("#year");
    const yearLabel = d3.select("#year-label");

    const countrySelect = d3.select("#countries")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)
        .property("selected", d => d === "USA");

    yearInput.on("input", function() {
        const selectedYear = +this.value;
        yearLabel.text(selectedYear);
        const selectedCountries = Array.from(countrySelect.filter(function() { return this.selected; }).nodes(), d => d.value);
        updateVisualization(data, selectedYear, selectedCountries, xScale, yScale, xAxis, yAxis, colorScale);
    });

    countrySelect.on("change", function() {
        const selectedYear = +yearInput.property("value");
        const selectedCountries = Array.from(countrySelect.filter(function() { return this.selected; }).nodes(), d => d.value);
        updateVisualization(data, selectedYear, selectedCountries, xScale, yScale, xAxis, yAxis, colorScale);
    });

    const initialYear = +yearInput.property("value");
    const initialCountries = Array.from(countrySelect.filter(function() { return this.selected; }).nodes(), d => d.value);
    updateVisualization(data, initialYear, initialCountries, xScale, yScale, xAxis, yAxis, colorScale);
}

function updateVisualization(data, year, selectedCountries, xScale, yScale, xAxis, yAxis, colorScale) {
    const filteredData = data.filter(d => d.year === year && selectedCountries.includes(d.country));

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
        .attr("fill", d => colorScale(d.country))
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
        .attr("cy", d => yScale(d.golds))
        .attr("fill", d => colorScale(d.country));

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
