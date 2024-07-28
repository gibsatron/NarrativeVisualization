const width = 960;
const height = 600;

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightgrey"); // Temporarily add background color

const projection = d3.geoNaturalEarth1()
    .scale(170)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

console.log("SVG:", svg);
console.log("Projection:", projection);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

const cityCoordinates = {
    "Barcelona": [2.1734, 41.3851],
    "London": [-0.1278, 51.5074],
    "Antwerpen": [4.4028, 51.2194],
    "Paris": [2.3522, 48.8566],
    "Calgary": [-114.0719, 51.0447],
    "Albertville": [6.3903, 45.6750],
    "Lillehammer": [10.4370, 61.1153],
    "Los Angeles": [-118.2437, 34.0522],
    "Salt Lake City": [-111.8910, 40.7608],
    "Helsinki": [24.9410, 60.1733],
    "Lake Placid": [-73.9819, 44.2795],
    "Sydney": [151.2093, -33.8688],
    "Atlanta": [-84.3880, 33.7490],
    "Stockholm": [18.0686, 59.3293],
    "Sochi": [39.7260, 43.6028],
    "Nagano": [138.2529, 36.6513],
    "Torino": [7.6869, 45.0703],
    "Beijing": [116.4074, 39.9042],
    "Rio de Janeiro": [-43.1729, -22.9068],
    "Athina": [23.7275, 37.9838],
    "Squaw Valley": [-120.2374, 39.1979],
    "Innsbruck": [11.4041, 47.2692],
    "Sarajevo": [18.4131, 43.8563],
    "Mexico City": [-99.1332, 19.4326],
    "Munich": [11.5820, 48.1351],
    "Seoul": [126.9780, 37.5665],
    "Berlin": [13.4050, 52.5200],
    "Oslo": [10.7522, 59.9139],
    "Cortina d'Ampezzo": [12.1357, 46.5405],
    "Melbourne": [144.9631, -37.8136],
    "Roma": [12.4964, 41.9028],
    "Amsterdam": [4.9041, 52.3676],
    "Montreal": [-73.5673, 45.5017],
    "Moskva": [37.6173, 55.7558],
    "Tokyo": [139.6917, 35.6895],
    "Vancouver": [-123.1216, 49.2827],
    "Grenoble": [5.7245, 45.1885],
    "Sapporo": [141.3545, 43.0621],
    "Chamonix": [6.8694, 45.9237],
    "St. Louis": [-90.1994, 38.6270],
    "Sankt Moritz": [9.8370, 46.4981],
    "Garmisch-Partenkirchen": [11.0997, 47.4926]
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

    // Log data to verify preprocessing
    console.log("Processed Data:", data);

    // Initialize the visualization
    initVisualization(data);
});

function initVisualization(data) {
    scene1(data); // Directly call the first scene for debugging
}

function scene1(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Overview of Olympic Games');

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(world => {
            console.log("World GeoJSON:", world); // Log world data to check if it is loaded correctly

            // Draw the map
            const map = svg.append("g")
                .selectAll("path")
                .data(world.features)
                .enter().append("path")
                .attr("fill", "#ccc")
                .attr("d", path);

            console.log("Map Paths:", map); // Log to check if map paths are created

            // Log data to verify circles data
            const filteredData = data.filter(d => d.longitude && d.latitude);
            console.log("Filtered Data for Circles:", filteredData);

            // Add circles for the Olympic Games
            const circles = svg.append("g")
                .selectAll("circle")
                .data(filteredData) // Filter out entries without coordinates
                .enter().append("circle")
                .attr("cx", d => projection([d.longitude, d.latitude])[0])
                .attr("cy", d => projection([d.longitude, d.latitude])[1])
                .attr("r", 5)
                .attr("fill", d => d.season === 'Summer' ? "orange" : "blue")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .on("mouseover", function(event, d) {
                    tooltip.html(`<strong>${d.city}, ${d.year}</strong><br>
                                  Events: ${d.event}<br>
                                  Countries: ${d.team}<br>
                                  Women Participated: ${d.sex === 'F' ? 'Yes' : 'No'}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("visibility", "visible");
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });

            console.log("Circles:", circles); // Log to check if circles are created

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
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
        });
}

function scene2(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Participation Trends Over the Years');
    // Add more D3 code for the participation trends visualization
}

function scene3(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Medal Distribution By Country');
    // Add more D3 code for the detailed exploration visualization
}

function scene4(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('Women in the Olympics');
    // Add more D3 code for the detailed exploration visualization
}

function scene5(data) {
    d3.select('#visualization').html(''); // Clear previous scene
    d3.select('#visualization').append('h1').text('User Exploration of Olympic Games');
    // Add more D3 code for the detailed exploration visualization
}
