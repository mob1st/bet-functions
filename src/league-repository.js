const { Localized, shortIsoToDate } = require('./common-data');
const api = require('./football-api');
const db = require('./football-db');
const imageTask = require('./football-image-task');
const { BinarySearchTree } = require('@datastructures-js/binary-search-tree')
const { League } = require('./league');

const WORLD_CUP_API_ID = 1
/**
 * Creates a league based on the given id. 
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
    const [leagueResponse, teamsResponse, matchesResponse] = await Promise.all([
        api.fetchLeague(leagueApiId, season),
        api.fetchTeams(leagueApiId, season),
        api.fetchMatches(leagueApiId, season)
    ]);

    // prepare data
    const dbId = `${league}_${season}`;
    const data = _fromApiToDb(
        dbId, 
        `api_footbal_league_${dbId}_name`,
        leagueResponse,
        teamsResponse,
        matchesResponse,
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
 * Maps the response from Football API to our data model that will be used by the clients.
 * 
 * @param {String} id the id of the data. should be some predefined value based on the content loaded
 * @param {String} nameResId the localized name of the league
 * @param {Array<Object>} leagueResponse the response from the API respective to the league
 * @param {Array<Object>} teamsResponse the response from the API respective to the teams of the league
 * @param {Array<Object>} matchesResponse the matches response from the API respective to the matches of the league
 * @returns the data object that will be persisted by the database
 */
function _fromApiToDb(id, nameResId, leagueResponse, teamsResponse, matchesResponse) {
    console.log('league-repository._fromApiToDb: handle leagues', JSON.stringify(leagueResponse));
    console.log('league-repository._fromApiToDb: handle teams',  JSON.stringify(teamsResponse));
    const leagueData = leagueResponse.response[0];    
    
    const teamImageFolderName = db.teamCollection(id);
    const teamsBinaryTree = new BinarySearchTree((a, b) => a.id - b.id);
    const teams = teamsResponse.response.map((teamData) => {
        const team = teamData.team;
        teamsBinaryTree.insert(team);
        return _teamData(teamImageFolderName, team);
    });    
    const matches = matchesResponse.response.map(
        (matchData) => _matchData(teamImageFolderName, teamsBinaryTree, matchData)
    );
    return {
        id: id,
        apiId: leagueData.league.id,        
        name: new Localized(leagueData.league.name, nameResId),
        start: shortIsoToDate(leagueData.seasons[0].start),
        end: shortIsoToDate(leagueData.seasons[0].end),
        teams: teams,
        matches: matches
    };
}

/**
 * Converts the given team from the API to the structure we will persist on the database
 * @param {Object} team provided by the API
 * @returns the team handled by the database
 */
function _teamData(imageFolderName, team) {
    console.log('league-repository._teamData: parsing team', JSON.stringify(team));    
    const id = _teamId(team);
    return {
        id: id,
        apiId: team.id,
        apiImageUrl: team.logo,
        imageFileName: `${imageFolderName}/${id}.${_getUrlExtension(team.logo)}`,        
        name: new Localized(team.name, `api_footbal_${id}_name`),
        apiImage: team.logo
    }
}

/**
 * Receives the match from API and maps it to our model.
 * 
 * Once the match structure from API has home and away teams without the code, used in the logic team Id definition,
 * I need to search in the current teams list
 * @param {String} teamImageFolderName the folder name used for the teams
 * @param {BinarySearchTree<Object>} teamsBinaryTree the binary search structure to find teams by id
 * @param {Object} match the match from API
 * @returns {Object} the match structure
 */
function _matchData(teamImageFolderName, teamsBinaryTree, match) {
    console.log('league-repository._matchData: parsing match', JSON.stringify(match.fixture.id));    
    const fixture = match.fixture;
    console.log('league-repository._matchData: finding home', JSON.stringify(match.teams.home));
    const home = teamsBinaryTree.find(match.teams.home).getValue();
    console.log('league-repository._matchData: finding away', JSON.stringify(match.teams.away));
    const away = teamsBinaryTree.find(match.teams.away).getValue();
    const round = match.league.round;
    console.log('league-repository._matchData: ---------');
    return {
        id: `${round}:${_teamId(home)}X${_teamId(away)}`,
        apiId: fixture.id,
        date: new Date(fixture.date),
        home: _teamData(teamImageFolderName, home),
        away: _teamData(teamImageFolderName, away),
        round: {
            allowDraw: true,
            round: round,
        },
    }
}

function _teamId(apiTeam) {
    const code = apiTeam.code.toLowerCase();
    return `team_${code}`;
}

/**
 * Returns the extension provided by the given URL
 * 
 * Given the examples:
 * - https://example.com/folder/file.jpg
 * - https://example.com/fold.er/fil.e.jpg?param.eter#hash=12.345
 * The return will be 'jpg'
 * @param {String} url 
 * @returns the extension of the file
 */
function _getUrlExtension(url) {
    return url
            .split(/[#?]/)[0]
            .split('.')
            .pop()
            .trim();
}

module.exports = {
    create    
}