const axios = require('axios').default;

const footballApi = axios.create({
    baseURL: 'https://api-football-v1.p.rapidapi.com/v3'
});

footballApi.defaults.headers.common['X-RapidAPI-Key'] = process.env.RAPID_API_KEY;
footballApi.defaults.headers.common['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';

/**
 * Fetches a league based on the given parameters
 * 
 * You need to check the API response to see the available league ids. 
 * The id for the World Cup is 1
 * @param {String} league the id of the league on Football API. 
 * @param {String} season the year of the season
 * @returns {Array<Object>} json response containing the data 
 */
async function fetchLeague(league, season) {
    return _fetch('leagues', { id: league, season: season });
}

/**
 * Fetches all teams that will play a specific league.
 * 
 * You need to check the API response to see the available league ids. 
 * The id for the World Cup is 1
 * @param {String} league the id of the league on Football API. 
 * @param {String} season the year of the season
 * @returns {Array<Object>} json response containing the data 
 */
async function fetchTeams(league, season) {
    return _fetch('teams', { league: league, season: season });
}

function fetchMatches(league, season) {
    return _fetch('fixtures', { league: league, season: season });
}

function fetchGroups(league, season) {
    return _fetch('standings', { league: league, season: season });
}

function fetchRounds(league, season) {
    return _fetch('fixtures/rounds', { league: league, season: season });
}

async function _fetch(
    path,
    params
) {
    const options = {
        params: params
    };
    const response = await footballApi.get(`/${path}`, options);
    const data = response.data;
    console.log(
        'football-api._fetch %s with %s -- response status code $d -- response data %d',
        path,
        JSON.stringify(params),
        response.status,
        JSON.stringify(data.results),
    );
    return data;
}

module.exports = {
    fetchLeague,
    fetchTeams,
    fetchMatches,
    fetchGroups,
    fetchRounds
};