const { Localized, shortIsoToDate } = require('./common-data');
const api = require('./football-api');
const db = require('./football-db');
const imageTask = require('./football-image-task');
const { League } = require('./league');

const WORLD_CUP_API_ID = 1
/**
 * creates a league based on the given id. 
 * 
 * Take a look at league.js to see the supported leageus
 * @param {Object} league the league info to be fetched. see the available constants
 * @param {Number} season the 4 digit year of the season
 * @returns the result operation returned by database
 * @author Pablo Baldez
 */
async function create(
    league, 
    season
) {
    console.log('league-repository.create: fetching league and teams from API', league, season);
    
    // fetch data from API
    const leagueApiId = _getApiId(league);
    const [leagueResponse, teamsResponse] = await Promise.all([
        api.fetchLeague(leagueApiId, season),
        api.fetchTeams(leagueApiId, season),
    ]);

    // prepare data
    const dbId = `${league}_${season}`;
    const data = _fromApiToDb(
        dbId, 
        `api_footbal_league_${dbId}_name`,
        leagueResponse,
        teamsResponse
    );

    // persist data on our disks (db & file system)
    await db.set(data);
    await imageTask.schedule(data);    
    return data;
}

function _getApiId(league) {
    if (league === League.WorldCup) {
        return WORLD_CUP_API_ID;
    } else {
        throw Error(`League id not supported: ${league}`);
    }
}

/**
 * Maps the response from Football API to our data model that will be used by the clients
 * @param {String} id the id of the data. should be some predefined value based on the content loaded
 * @param {String} nameResId the localized name of the league
 * @param {Object} leagueResponse the response from the API respective to the league
 * @param {Object} teamsResponse the response from the API respective to the teams of the league
 * @returns the data object that will be persisted by the database
 */
function _fromApiToDb(id, nameResId, leagueResponse, teamsResponse) {
    console.log('league-repository._fromApiToDb: handle leagues', JSON.stringify(leagueResponse));
    console.log('league-repository._fromApiToDb: handle teams',  JSON.stringify(teamsResponse));
    const leagueData = leagueResponse.response[0];
    const teams = teamsResponse.response;
    return {
        id: id,
        apiId: leagueData.league.id,
        imageFolderName: db.teamCollection(id),
        name: new Localized(leagueData.league.name, nameResId),
        start: shortIsoToDate(leagueData.seasons[0].start),
        end: shortIsoToDate(leagueData.seasons[0].end),
        teams: teams.map((teamData) => _teamData(teamData.team)),
    };
}

/**
 * converts the given team from the API to the structure we will persist on the databa
 * @param {Object} team provided by the API
 * @returns the team handled by the database
 */
function _teamData(team) {
    console.log('league-repository._teamData: parsing team', JSON.stringify(team));
    const code = team.code.toLowerCase();
    return {
        id: `team_${code}`,
        apiId: team.id,
        apiImageUrl: team.logo,
        imageFileName: imageFileName(team),
        national: team.national,
        name: new Localized(team.name, `api_footbal_team_${code}_name`),
        apiImage: team.logo
    }
}

function imageFileName(code) {    
    return `team_${code}.png`;
}

module.exports = {
    create    
}