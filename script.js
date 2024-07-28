const width = 960;
const height = 600;
const margin = { top: 70, right: 30, bottom: 70, left: 100 };

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

d3.csv('./athlete_events.csv').then(data => {
    const medalData = preprocessData(data);
    const scenes = [scene1, scene2, scene3];
    let currentScene = 0;

    initControls(medalData);
    scenes[currentScene](medalData);

    d3.select("#scene1").on("click", () => {
        currentScene = 0;
        scenes[currentScene](medalData);
    });

    d3.select("#scene2").on("click", () => {
        currentScene = 1;
        scenes[currentScene](medalData);
    });

    d3.select("#scene3").on("click", () => {
        currentScene = 2;
        scenes[currentScene](medalData);
    });

    d3.select("#year").on("input", function() {
        d3.select("#year-label").text(this.value);
        scenes[currentScene](medalData);
    });
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

function initControls(data) {
    d3.select("#year").on("input", function() {
        d3.select("#year-label").text(this.value);
    });
}

function scene1(data) {
    const year = +d3.select("#year").property("value");
    svg.selectAll("*").remove();

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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain([...new Set(data.map(d => d.country))]);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const filteredData = data.filter(d => d.year === year);

    xScale.domain([0, d3.max(filteredData, d => d.participants)]);
    yScale.domain([0, d3.max(filteredData, d => d.golds)]);

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

function scene2(data) {
    const year = +d3.select("#year").property("value");
    svg.selectAll("*").remove();

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Scene 2: Women's Participation");

    // Add scene-specific content here
    // For example, plot the number of female participants and medals won by women

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain([...new Set(data.map(d => d.country))]);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const filteredData = data.filter(d => d.year === year && d.sex === "F");

    xScale.domain([0, d3.max(filteredData, d => d.participants)]);
    yScale.domain([0, d3.max(filteredData, d => d.totalMedals)]);

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
        .attr("cy", d => yScale(d.totalMedals))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.country))
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
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
        .attr("cy", d => yScale(d.totalMedals))
        .attr("fill", d => colorScale(d.country));

    // Annotations
    const usData = filteredData.find(d => d.country === "USA");
    if (usData) {
        svg.append("text")
            .attr("x", xScale(usData.participants))
            .attr("y", yScale(usData.totalMedals) - 10)
            .attr("fill", "red")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(`USA: ${usData.totalMedals} Medals (${(usData.medalEfficiency * 100).toFixed(2)}%)`);
    }
}

function scene3(data) {
    const year = +d3.select("#year").property("value");
    svg.selectAll("*").remove();

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Scene 3: Performance in Key Sports");

    // Add scene-specific content here
    // For example, plot the number of medals won by the USA in key sports like gymnastics and swimming

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain([...new Set(data.map(d => d.country))]);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const filteredData = data.filter(d => d.year === year && (d.sport === "Gymnastics" || d.sport === "Swimming"));

    xScale.domain([0, d3.max(filteredData, d => d.participants)]);
    yScale.domain([0, d3.max(filteredData, d => d.totalMedals)]);

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
        .attr("cy", d => yScale(d.totalMedals))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.country))
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
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
        .attr("cy", d => yScale(d.totalMedals))
        .attr("fill", d => colorScale(d.country));

    // Annotations
    const usData = filteredData.find(d => d.country === "USA");
    if (usData) {
        svg.append("text")
            .attr("x", xScale(usData.participants))
            .attr("y", yScale(usData.totalMedals) - 10)
            .attr("fill", "red")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(`USA: ${usData.totalMedals} Medals (${(usData.medalEfficiency * 100).toFixed(2)}%)`);
    }
}
