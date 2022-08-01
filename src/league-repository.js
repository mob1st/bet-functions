const { Localized } = require('./common-data');
const api = require('./football-api');
const db = require('./football-db');

/**
 * populates the world cup league and teams
 * @returns the result operation returned by database
 * @author Pablo Baldez
 */
async function populateWorldCup() {
    const responses = await Promise.all([
        api.fetchLeague('1', '2022'),
        api.fetchTeams('1', '2022'),
    ]);
    
    const data = _fromApiToDb(
        'world-cup-2022', 
        'api_league_world_cup_name', 
        responses[0],
        responses[1]
    );
    return await db.set(data);
}

/**
 * Maps the response from Football API to our data model that will be used by the clients
 * @param {String} id the id of the data. should be some predefined value based on the content loaded
 * @param {String} nameResId the localized name of the league
 * @param {any} leagueResponse the response from the API respective to the league
 * @param {any} teamsResponse the response from the API respective to the teams of the league
 * @returns the data object that will be persisted by the database
 */
function _fromApiToDb(id, nameResId, leagueResponse, teamsResponse) {
    const league = leagueResponse.response[0];
    const teams = teamsResponse.response;
    return {
        id: id,
        apiId: league.league.id,
        name: new Localized(league.league.name, nameResId),
        start: Date(league.seasons[0].start),
        end: Date(league.seasons[0].end),
        teams: teams.map((team) => _teamData(team)),
    };
}

/**
 * converts the given team from the API to the structure we will persist on the databa
 * @param {any} team provided by the API
 * @returns the team handled by the database
 */
function _teamData(team) {
    const code = team.code.toLowerCase();
    return {
        id: `team_${code}`,
        apiId: team.id,
        name: new Localized(team.name, `api_team_${code}_name`),
    }
}

module.exports = {
    populateWorldCup
}