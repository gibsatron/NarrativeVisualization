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
    console.log(data);

    // Initialize the visualization
    initVisualization(data);
});
