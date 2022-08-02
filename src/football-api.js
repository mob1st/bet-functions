require('dotenv').config()
const axios = require('axios').default;

const footbalApi = axios.create({
    baseURL: 'https://api-football-v1.p.rapidapi.com/v3'
});

footbalApi.defaults.headers.common['X-RapidAPI-Key'] = process.env.RAPID_API_KEY
footbalApi.defaults.headers.common['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com'

/**
 * Fetches a league based on the given parameters
 * 
 * You need to check the API response to see the available league ids. 
 * The id for the World Cup is 1
 * @param {String} league the id of the league on Football API. 
 * @param {String} season the year of the season
 * @returns json response contaning the data 
 */
async function fetchLeague(league, season) {
    const options = {    
        params: { id: league, season: season },
    };
    console.log('football-api.fetchLeague', JSON.stringify(options));
    const response = await footbalApi.get('/leagues', options);    
    _logResponse('league', response);
    return response.data;
}

/**
 * Fetches all teams that will play a specific league.
 * 
 * You need to check the API response to see the available league ids. 
 * The id for the World Cup is 1
 * @param {String} league the id of the league on Football API. 
 * @param {String} season the year of the season
 * @returns json response contaning the data 
 */
async function fetchTeams(league, season) {
    const options = {
        params: { league: league, season: season }
    };    
    console.log('football-api.fetchTeams', JSON.stringify(options));
    const response = await footbalApi.get('/teams', options);    
    _logResponse('teams', response);
    return response.data;
}

function _logResponse(path, response) {
    console.log('football-api._logResponse', path, response.status, JSON.stringify(response.data));
}

module.exports = {
    fetchLeague,
    fetchTeams,    
};