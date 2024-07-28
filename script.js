d3.csv('./athlete_events.csv').then(data => {
    // Preprocess data
    data.forEach(d => {
        d.id = +d.ID;
        d.sex = +d.Sex;
        d.year = +d.Year;
        d.age = +d.Age;
        d.height = +d.Height;
        d.weight = +d.Weight;
        d.team = +d.Team;
        d.games = +d.Games;
        d.season = +d.Season;
        d.city = +d.City;
        d.sport = +d.Sport;
        d.event = +d.Event;
        d.medal = +d.Medal;
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
    // Add more D3 code for the overview visualization
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

