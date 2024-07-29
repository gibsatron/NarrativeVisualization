const width = 960;
const height = 600;
const margin = { top: 70, right: 30, bottom: 70, left: 100 };

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

const regions = {
    "Africa": ["ALG", "ANG", "BEN", "BOT", "BUR", "CAF", "CIV", "CMR", "COD", "CPV", "DJI", "EGY", "ERI", "ETH", "GAB", "GHA", "GIN", "KEN", "LES", "LBR", "LBA", "MAD", "MAW", "MLI", "MOZ", "MRI", "MTN", "NAM", "NGR", "NIG", "RWA", "SEN", "SEY", "SLE", "SOM", "SUD", "SWZ", "TAN", "TOG", "TUN", "UGA", "ZAM", "ZIM"],
    "Asia": ["AFG", "BRN", "BAN", "BHU", "BRU", "CAM", "CHN", "HKG", "INA", "IND", "IRI", "IRQ", "JPN", "JOR", "KAZ", "KGZ", "KOR", "KUW", "LAO", "LIB", "MAC", "MAS", "MDV", "MGL", "MYA", "NEP", "OMA", "PAK", "PHI", "PLE", "PRK", "QAT", "SGP", "SRI", "SYR", "THA", "TLS", "TJK", "TKM", "UAE", "UZB", "VIE", "YEM"],
    "Europe": ["ALB", "AND", "ARM", "AUT", "AZE", "BLR", "BEL", "BIH", "BUL", "CRO", "CYP", "CZE", "DEN", "EST", "FIN", "FRA", "GEO", "GER", "GRE", "HUN", "ISL", "IRL", "ISR", "ITA", "KOS", "LAT", "LIE", "LTU", "LUX", "MKD", "MLT", "MDA", "MON", "MNE", "NED", "NOR", "POL", "POR", "ROU", "RUS", "SMR", "SRB", "SLO", "ESP", "SWE", "SUI", "SVK", "UKR", "GBR"],
    "North America": ["ANT", "ARU", "BAH", "BAR", "BER", "BIZ", "CAN", "CAY", "CRC", "CUB", "DOM", "ESA", "GRN", "GUA", "HAI", "HON", "IVB", "JAM", "LCA", "MEX", "NCA", "PAN", "PUR", "SKN", "TTO", "USA"],
    "Oceania": ["ASA", "AUS", "COK", "FIJ", "FSM", "GUM", "KIR", "MHL", "NRU", "NZL", "PLW", "PNG", "SAM", "SOL", "TGA", "TUV", "VAN"],
    "South America": ["ARG", "BOL", "BRA", "CHI", "COL", "ECU", "GUY", "PAR", "PER", "SUR", "URU", "VEN"]
};

// Assign regions to countries
const countryRegionMap = {};
Object.keys(regions).forEach(region => {
    regions[region].forEach(country => {
        countryRegionMap[country] = region;
    });
});

d3.csv('./athlete_events.csv').then(data => {
    console.log("Raw Data:", data); // Debugging line
    const medalData = preprocessData(data);
    console.log("Processed Medal Data:", medalData); // Debugging line
    const scenes = [scene1, scene2, scene3];
    let currentScene = 0;

    initControls(medalData);

    const initialYear = +d3.select("#year").property("value");
    const initialRegions = Array.from(d3.selectAll(".region-filter").nodes(), d => d.value);
    const initialSport = "Gymnastics";
    scenes[currentScene](medalData, initialYear, initialRegions, initialSport);

    d3.select("#scene1").on("click", () => {
        currentScene = 0;
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        scenes[currentScene](medalData, selectedYear, selectedRegions);
    });

    d3.select("#scene2").on("click", () => {
        currentScene = 1;
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        scenes[currentScene](medalData, selectedYear, selectedRegions);
    });

    d3.select("#scene3").on("click", () => {
        currentScene = 2;
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        const selectedSport = d3.select("#sport").property("value");
        scenes[currentScene](medalData, selectedYear, selectedRegions, selectedSport);
    });

    d3.select("#year").on("input", function() {
        d3.select("#year-label").text(this.value);
        updateScene();
    });

    d3.selectAll(".region-filter").on("change", updateScene);

    d3.select("#sport").on("change", updateScene);  // Add this line

    function updateScene() {
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        const selectedSport = currentScene === 2 ? d3.select("#sport").property("value") : null;
        console.log("Selected Year:", selectedYear); // Debugging line
        console.log("Selected Regions:", selectedRegions); // Debugging line
        console.log("Selected Sport:", selectedSport); // Debugging line
        scenes[currentScene](medalData, selectedYear, selectedRegions, selectedSport);
    }
});

function preprocessData(data) {
    const countryYearData = {};

    data.forEach(d => {
        const noc = d.NOC;
        const team = d.Team; // Extract team (country) name
        if (!countryYearData[noc]) {
            countryYearData[noc] = { region: countryRegionMap[noc] || "Other", team, years: {} };
        }
        if (!countryYearData[noc].years[d.Year]) {
            countryYearData[noc].years[d.Year] = { participants: 0, golds: 0, totalMedals: 0, femaleParticipants: 0, sports: {} };
        }
        countryYearData[noc].years[d.Year].participants += 1;
        if (d.Sex === "F") {
            countryYearData[noc].years[d.Year].femaleParticipants += 1;
        }
        if (d.Medal === "Gold") {
            countryYearData[noc].years[d.Year].golds += 1;
        }
        if (d.Medal !== "NA") {
            countryYearData[noc].years[d.Year].totalMedals += 1;
        }
        if (!countryYearData[noc].years[d.Year].sports[d.Sport]) {
            countryYearData[noc].years[d.Year].sports[d.Sport] = { medals: 0, events: new Set() };
        }
        if (d.Medal !== "NA") {
            countryYearData[noc].years[d.Year].sports[d.Sport].medals += 1;
        }
        countryYearData[noc].years[d.Year].sports[d.Sport].events.add(d.Event);
    });

    const medalData = [];
    for (const noc in countryYearData) {
        for (const year in countryYearData[noc].years) {
            for (const sport in countryYearData[noc].years[year].sports) {
                medalData.push({
                    noc,
                    country: countryYearData[noc].team,
                    region: countryYearData[noc].region,
                    year: +year,
                    sport,
                    medals: countryYearData[noc].years[year].sports[sport].medals,
                    events: countryYearData[noc].years[year].sports[sport].events.size,
                    participants: countryYearData[noc].years[year].participants,
                    golds: countryYearData[noc].years[year].golds,
                    totalMedals: countryYearData[noc].years[year].totalMedals,
                    femaleParticipants: countryYearData[noc].years[year].femaleParticipants,
                    medalEfficiency: countryYearData[noc].years[year].totalMedals / countryYearData[noc].years[year].participants,
                    femaleParticipationPercentage: countryYearData[noc].years[year].femaleParticipants / countryYearData[noc].years[year].participants * 100
                });
            }
        }
    }

    return medalData;
}

function scene1(data, selectedYear, selectedRegions) {
    d3.select("#description").html(`
        <h2>Scene 1: Gold Medals vs. Number of Participants</h2>
        <p>This scene shows the relationship between the number of participants and the number of gold medals won by each country in a selected year.</p>
        <p>Hover over the circles to see more details about each country.</p>
    `);

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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(regions));

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Set static domains based on the entire dataset
    const maxParticipants = d3.max(data, d => d.participants);
    const maxGolds = d3.max(data, d => d.golds);

    xScale.domain([0, maxParticipants * 1.1]); // Add buffer to the max value
    yScale.domain([0, maxGolds]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .call(yAxis);

    const filteredData = data.filter(d => d.year === selectedYear && selectedRegions.includes(d.region));

    console.log("Filtered Data:", filteredData); // Debugging line

    const circles = svg.selectAll(".circle").data(filteredData, d => d.noc);

    circles.exit().remove();

    circles.enter().append("circle")
        .attr("class", "circle")
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.golds))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.region))
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
                          Female Participants: ${d.femaleParticipants}<br>
                          Gold Medals: ${d.golds}<br>
                          Total Medals: ${d.totalMedals}<br>
                          Medal Efficiency: ${(d.medalEfficiency * 100).toFixed(2)}%<br>
                          Female Participation: ${d.femaleParticipationPercentage.toFixed(2)}%`)
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
        .attr("fill", d => colorScale(d.region));

    // Annotations
    const usData = filteredData.find(d => d.noc === "USA");
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

// Scene 2 function
function scene2(data, selectedYear, selectedRegions) {
    d3.select("#description").html(`
        <h2>Scene 2: Female Participation vs. Number of Participants</h2>
        <p>This scene shows the relationship between the number of participants and the percentage of female participants by each country in a selected year.</p>
        <p>Hover over the circles to see more details about each country.</p>
    `);

    svg.selectAll("*").remove();

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Female Participation vs. Number of Participants");

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
        .text("Female Participation (%)");

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(regions));

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Set static domains based on the entire dataset
    const maxParticipants = d3.max(data, d => d.participants);
    const maxFemaleParticipation = 100; // percentage

    xScale.domain([0, maxParticipants * 1.1]); // Add buffer to the max value
    yScale.domain([0, maxFemaleParticipation]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .call(yAxis);

    const filteredData = data.filter(d => d.year === selectedYear && selectedRegions.includes(d.region));

    console.log("Filtered Data:", filteredData); // Debugging line

    const circles = svg.selectAll(".circle").data(filteredData, d => d.noc);

    circles.exit().remove();

    circles.enter().append("circle")
        .attr("class", "circle")
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.femaleParticipationPercentage))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.region))
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
                          Female Participants: ${d.femaleParticipants}<br>
                          Female Participation: ${d.femaleParticipationPercentage.toFixed(2)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("visibility", "visible");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    circles
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.femaleParticipationPercentage))
        .attr("fill", d => colorScale(d.region));

    // Annotations
    const usData = filteredData.find(d => d.noc === "USA");
    if (usData) {
        svg.append("text")
            .attr("x", xScale(usData.participants))
            .attr("y", yScale(usData.femaleParticipationPercentage) - 10)
            .attr("fill", "red")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(`USA: ${usData.femaleParticipationPercentage.toFixed(2)}% Female Participation`);
    }
}

// Scene 3 function
function scene3(data, selectedYear, selectedRegions, selectedSport) {
    d3.select("#description").html(`
        <h2>Scene 3: Medals in ${selectedSport}</h2>
        <p>This scene shows the number of medals won in ${selectedSport} by each country in a selected year.</p>
        <p>Hover over the circles to see more details about each country.</p>
    `);

    svg.selectAll("*").remove();

    // Add sport filter dynamically
    if (d3.select("#sport").empty()) {
        d3.select("#controls").append("select")
            .attr("id", "sport")
            .selectAll("option")
            .data([...new Set(data.map(d => d.sport))])
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);
    }

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text(`Medals in ${selectedSport}`);

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
        .text("Number of Medals");

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(regions));

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Set static domains based on the entire dataset
    const maxParticipants = d3.max(data, d => d.participants);
    const maxMedals = d3.max(data, d => d.medals);

    xScale.domain([0, maxParticipants * 1.1]); // Add buffer to the max value
    yScale.domain([0, maxMedals]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .call(yAxis);

    const filteredData = data.filter(d => d.year === selectedYear && selectedRegions.includes(d.region) && d.sport === selectedSport);

    console.log("Filtered Data:", filteredData); // Debugging line

    const circles = svg.selectAll(".circle").data(filteredData, d => d.noc);

    circles.exit().remove();

    circles.enter().append("circle")
        .attr("class", "circle")
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.medals))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.region))
        .on("mouseover", function(event, d) {
            tooltip.html(`<strong>${d.country}</strong><br>
                          Year: ${d.year}<br>
                          Participants: ${d.participants}<br>
                          Medals: ${d.medals}<br>
                          Events: ${d.events}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("visibility", "visible");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    circles
        .attr("cx", d => xScale(d.participants))
        .attr("cy", d => yScale(d.medals))
        .attr("fill", d => colorScale(d.region));

    // Annotations
    const usData = filteredData.find(d => d.noc === "USA");
    if (usData) {
        svg.append("text")
            .attr("x", xScale(usData.participants))
            .attr("y", yScale(usData.medals) - 10)
            .attr("fill", "red")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(`USA: ${usData.medals} Medals in ${selectedSport}`);
    }
}

function initControls(data) {
    d3.select("#controls").html(""); // Clear any existing controls

    d3.select("#controls").append("label")
        .attr("for", "year")
        .text("Year: ");

    d3.select("#controls").append("input")
        .attr("type", "range")
        .attr("id", "year")
        .attr("min", 1896)
        .attr("max", 2016)
        .attr("value", 2016)
        .attr("step", 4);

    d3.select("#controls").append("span")
        .attr("id", "year-label")
        .text("2016");

    d3.select("#controls").append("div")
        .selectAll("label")
        .data(Object.keys(regions))
        .enter()
        .append("label")
        .text(d => d)
        .append("input")
        .attr("type", "checkbox")
        .attr("class", "region-filter")
        .attr("value", d => d)
        .property("checked", true);

    // Add the sport filter here for initialization (scene 3 will handle displaying it)
    d3.select("#controls").append("label")
        .attr("for", "sport")
        .text("Sport: ");

    d3.select("#controls").append("select")
        .attr("id", "sport")
        .selectAll("option")
        .data([...new Set(data.map(d => d.sport))])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
}
