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
    const scenes = [scene1];
    let currentScene = 0;

    initControls(medalData);

    const initialYear = +d3.select("#year").property("value");
    const initialRegions = Array.from(d3.selectAll(".region-filter").nodes(), d => d.value);
    scenes[currentScene](medalData, initialYear, initialRegions);

    d3.select("#scene1").on("click", () => {
        currentScene = 0;
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        scenes[currentScene](medalData, selectedYear, selectedRegions);
    });

    d3.select("#year").on("input", function() {
        d3.select("#year-label").text(this.value);
        updateScene();
    });

    d3.selectAll(".region-filter").on("change", updateScene);

    function updateScene() {
        const selectedYear = +d3.select("#year").property("value");
        const selectedRegions = Array.from(d3.selectAll(".region-filter").filter(function() { return this.checked; }).nodes(), d => d.value);
        console.log("Selected Year:", selectedYear); // Debugging line
        console.log("Selected Regions:", selectedRegions); // Debugging line
        scenes[currentScene](medalData, selectedYear, selectedRegions);
    }
});

function preprocessData(data) {
    const countryYearData = {};

    data.forEach(d => {
        const noc = d.NOC;
        if (!countryYearData[noc]) {
            countryYearData[noc] = { region: countryRegionMap[noc] || "Other" };
        }
        if (!countryYearData[noc][d.Year]) {
            countryYearData[noc][d.Year] = { participants: 0, golds: 0, totalMedals: 0, femaleParticipants: 0 };
        }
        countryYearData[noc][d.Year].participants += 1;
        if (d.Sex === "F") {
            countryYearData[noc][d.Year].femaleParticipants += 1;
        }
        if (d.Medal === "Gold") {
            countryYearData[noc][d.Year].golds += 1;
        }
        if (d.Medal !== "NA") {
            countryYearData[noc][d.Year].totalMedals += 1;
        }
    });

    const medalData = [];
    for (const noc in countryYearData) {
        for (const year in countryYearData[noc]) {
            if (year !== "region") {
                medalData.push({
                    noc,
                    region: countryYearData[noc].region,
                    year: +year,
                    participants: countryYearData[noc][year].participants,
                    golds: countryYearData[noc][year].golds,
                    totalMedals: countryYearData[noc][year].totalMedals,
                    femaleParticipants: countryYearData[noc][year].femaleParticipants,
                    medalEfficiency: countryYearData[noc][year].totalMedals / countryYearData[noc][year].participants,
                    femaleParticipationPercentage: countryYearData[noc][year].femaleParticipants / countryYearData[noc][year].participants * 100
                });
            }
        }
    }

    return medalData;
}

function initControls(data) {
    const regionOptions = Object.keys(regions);
    const regionFilters = d3.select("#region-filters")
        .selectAll("label")
        .data(regionOptions)
        .enter()
        .append("label");

    regionFilters.append("input")
        .attr("type", "checkbox")
        .attr("class", "region-filter")
        .attr("value", d => d)
        .property("checked", true);

    regionFilters.append("span")
        .text(d => d);
}

function scene1(data, selectedYear, selectedRegions) {
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

    const color
