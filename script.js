const width = 960;
const height = 600;

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoNaturalEarth1()
    .scale(170)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

const cityCoordinates = {
    "Athens": [23.7275, 37.9838],
    "Chamonix": [6.8466, 46.5206],
    "Paris": [2.3522, 48.8566],
    "St. Louis": [-90.1994, 38.6270],
    "London": [-0.1278, 51.5074],
    "Stockholm": [18.0686, 59.3293],
    "Antwerp": [4.4028, 51.2194],
    "Amsterdam": [4.9041, 52.3676],
    "Los Angeles": [-118.2437, 34.0522],
    "Berlin": [13.4050, 52.5200],
    "Helsinki": [24.9410, 60.1733],
    "Oslo": [10.7522, 59.9139],
    "Melbourne": [144.9631, -37.8136],
    "Rome": [12.4964, 41.9028],
    "Tokyo": [139.6917, 35.6895],
    "Mexico City": [-99.1332, 19.4326],
    "Munich": [11.5820, 48.1351],
    "Montreal": [-73.5673, 45.5017],
    "Moscow": [37.6173, 55.7558],
    "Seoul": [126.9780, 37.5665],
    "Barcelona": [2.1734, 41.3851],
    "Atlanta": [-84.3880, 33.7490],
    "Sydney": [151.2093, -33.8688],
    "Salt Lake City": [-111.8910, 40.7608],
    "Beijing": [116.4074, 39.9042],
    "Vancouver": [-123.1216, 49.2827],
    "Sochi": [39.7260, 43.6028],
    "Rio de Janeiro": [-43.1729, -22.9068],
    "Pyeongchang": [128.3306, 37.6381]
};

d3.csv('./athlete_events.csv').then(data => {
    // Preprocess data
    data.forEach(d => {
        d.id = +d.ID;
        d.sex = d.Sex;
        d.year = +d.Year;
        d.age = +d.Age;
        d.height = +d.Height;
        d.weight = +d.Weight;
        d.team = d.Team;
        d.games = d.Games;
        d.season = d.Season;
        d.city = d.City;
        d.sport = d.Sport;
        d.event = d.Event;
        d.medal = d.Medal;

        // Add coordinates from lookup table
        if (cityCoordinates[d.city]) {
            d.longitude = cityCoordinates[d.city][0];
            d.latitude = cityCoordinates[d.city][1];
        } else {
            d.longitude = null;
            d.latitude = null;
        }
    });

    // Initialize the visualization
    initVisualization(data);
});

function initVisualization(data) {
    let currentScene = 0;
    const scenes = [
        scene1,
        scene2,
        scene3
    ];

    // Initial scene setup
    scenes[currentScene](data);

    // Navigation
    d3.select('#nextButton')
        .on('click', () => {
            currentScene = (currentScene + 1) % scenes.length;
            scenes[currentScene](data);
        });
}

function scene1(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Overview of Olympic Games');

    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    ]).then(([world]) => {
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(world.features)
            .enter().append("path")
            .attr("fill", "#ccc")
            .attr("d", path);

        // Add circles for the Olympic Games
        svg.append("g")
            .selectAll("circle")
            .data(data.filter(d => d.longitude && d.latitude)) // Filter out entries without coordinates
            .enter().append("circle")
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("r", 5)
            .attr("fill", d => d.season === 'Summer' ? "orange" : "blue")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                tooltip.html(`<strong>${d.city}, ${d.year}</strong><br>
                              Events: ${d.events}<br>
                              Countries: ${d.countries}<br>
                              Women Participated: ${d.women ? 'Yes' : 'No'}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("visibility", "visible");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // Annotate the first games
        svg.append("text")
            .attr("x", projection([23.7275, 37.9838])[0])
            .attr("y", projection([23.7275, 37.9838])[1] - 10)
            .attr("fill", "black")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text("First Summer Olympics (1896)");

        svg.append("text")
            .attr("x", projection([6.8466, 46.5206])[0])
            .attr("y", projection([6.8466, 46.5206])[1] - 10)
            .attr("fill", "black")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text("First Winter Olympics (1924)");
    });
}

function scene2(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Participation Trends Over the Years');
    // Add more D3 code for the participation trends visualization
}

function scene3(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Detailed Exploration: Basketball');
    // Add more D3 code for the detailed exploration visualization
}
