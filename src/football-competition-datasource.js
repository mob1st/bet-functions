const api = require('./rapid-football-api');
const { CompetitionInput, Competition, Confrontation, ConfrontationStatus } = require('./competition-entities');
const { FootballMatch, Team } = require('./football-entities');
const { AvlTree } = require('@datastructures-js/binary-search-tree');
const { getUrlExtension } = require('./common-data');
const fs = require('fs');
const path = require('path');

/**
 * Uses the API-Football to create the competition based on the given entry
 * @param {CompetitionInput} input the entry used to create the competition
 * @returns the competition containing the teams and the contests
 */
async function fetch(input) {
    const responses = await Promise.all([
        competitionTranslation(input.code),
        api.fetchLeague(input.apiId, input.season),
        api.fetchTeams(input.apiId, input.season),
        api.fetchMatches(input.apiId, input.season),
        api.fetchGroups(input.apiId, input.season),
        api.fetchRounds(input.apiId, input.season),
    ]);
    return buildCompetition(input, ...responses);
}

/**
 * @param {CompetitionInput} input
 * @param {Array<Object>} leagueResponse 
 * @param {Array<Object>} teamsResponse 
 * @param {Array<Object>} matchesResponse 
 * @param {Array<Object>} groupsResponse 
 * @param {Array<Object>} roundsResponse 
 * @return {Competition}
 */
function buildCompetition(
    input,
    translations,
    leagueResponse,
    teamsResponse,
    matchesResponse,
    groupsResponse,
    roundsResponse,
) {
    const leagueData = leagueResponse.response[0];
    const { teamsBinaryTree, teamsList } = _teamsBinaryTree(
        translations,
        input.code,
        groupsResponse.response,
        teamsResponse.response,
    );
    const confrontations = matchesResponse.response.map(
        (match) => _footballConfrontation(teamsBinaryTree, match)
    );
    const season = leagueData.seasons[0];
    const logo = leagueData.league.logo;
    return {
        code: input.code,
        season: leagueData.seasons[0].year,
        name: translations.competition_name,
        startAt: new Date(season.start),
        endAt: new Date(season.end),
        currentRound: 0,
        rounds: roundsResponse.response,
        teams: teamsList,
        confrontations: confrontations,
        logo: logo,
        fileName: competitionFileName(input.code, logo)
    }
}

function competitionTranslation(competitionCode) {
    return new Promise((resolve, reject) => {
        try {
            console.debug('loading translation files');
            const jsonPath = path.join(__dirname, '..', 'static/translations', `${competitionCode}.json`);
            const jsonString = fs.readFileSync(jsonPath, 'utf-8');
            resolve(JSON.parse(jsonString));
        } catch (e) {
            console.error('failure to load translation files', e);
            reject(e);
        }
    });
}

/**
 * Creates a binary tree containing all teams with code and group
 * @param {Object} translations the translation json object
 * @param {competitionCode} competitionCode the code of the competition
 * @param {Array<Object>} groupsResponse api response containing the groups
 * @param {Array<Object>} teamsResponse tree of teams without group
 * @return {AvlTree<Team>} tree of teams including the group
 */
function _teamsBinaryTree(translations, competitionCode, groupsResponse, teamsResponse) {
    const teamsBinaryTree = new AvlTree((a, b) => a.apiId - b.apiId);
    const standings = groupsResponse[0].league.standings;
    const flatStandings = [].concat.apply([], standings);
    const sortedFlatStandings = flatStandings.sort((a, b) => a.team.id - b.team.id);
    const sortedTeamsWithCode = teamsResponse.sort((a, b) => a.team.id - b.team.id);
    const listOfTeams = []
    console.debug('sortedFlatStandings $s', JSON.stringify(sortedFlatStandings.map((t) => t.team.id)));
    console.debug('sortedTeamsWithCode $s', JSON.stringify(sortedTeamsWithCode.map((t) => t.team.id)));
    sortedTeamsWithCode.forEach((teamHolder, index) => {
        const apiTeam = teamHolder.team;
        const team = teamData(translations, competitionCode, apiTeam, sortedFlatStandings[index]);
        listOfTeams.push(team);
        teamsBinaryTree.insert(team);
    });
    console.debug('tree created with height %d items', teamsBinaryTree.count());

    return { teamsBinaryTree: teamsBinaryTree, teamsList: listOfTeams };
}

/**
 * @param {String} competitionCode
 * @param {Object} apiTeam 
 * @param {Object} apiStanding
 * @returns {Team}
 */
function teamData(translations, competitionCode, apiTeam, apiStanding) {
    const translatedNameProperty = teamName(apiTeam);
    return {
        apiId: apiTeam.id,
        name: translations[translatedNameProperty],
        code: apiTeam.code,
        logo: apiTeam.logo,
        fileName: teamFileName(competitionCode, apiTeam.logo),
        group: apiStanding.group,
    }
}

/**
 * Receives the match from API and maps it to our model.
 * 
 * Once the match structure from API has home and away teams without the code, used in the logic team Id definition,
 * I need to search in the current teams list 
 * @param {AvlTree<Team>} teamsBinaryTree the binary search structure to find teams by id
 * @param {Object} match the match from API
 * @returns {Confrontation} the match structure
 */
function _footballConfrontation(teamsBinaryTree, match) {
    const fixture = match.fixture;

    const homeNode = teamsBinaryTree.find({ apiId: match.teams.home.id });
    const home = homeNode.getValue();
    console.debug('find home team %s in the node with height %d', home.apiId, homeNode.getHeight());

    const awayNode = teamsBinaryTree.find({ apiId: match.teams.away.id });
    const away = awayNode.getValue();
    console.debug('find home team %s in the node with height %d', away.apiId, awayNode.getHeight());

    const round = match.league.round;
    return {
        expectedDuration: 90,
        apiId: fixture.id,
        startAt: new Date(fixture.date),
        allowBetsUntil: new Date(fixture.date),
        round: round,
        group: home.group,
        status: ConfrontationStatus.NotStarted,
        contest: FootballMatch.Factory(
            home,
            away
        ),
    }
}

function teamName(team) {
    return `competition_team_${team.code.toLowerCase()}_name`;
}

function competitionFileName(code, logo) {
    return `competition/${code.toLocaleLowerCase()}/logo.${getUrlExtension(logo)}`;
}

function teamFileName(competitionCode, logo) {
    return `competition/${competitionCode}/team/logo.${getUrlExtension(logo)}`;
}

module.exports = {
    fetch
}