const api = require('./rapid-football-api');
const { CompetitionInput, åCompetition, Confrontation } = require('./competition-entities');
const { FootballMatch } = require('./football-entities');
const { AvlTree } = require('@datastructures-js/binary-search-tree');

/**
 * Uses the API-Football to create the competition based on the given entry
 * @param {CompetitionInput} input the entry used to create the competition
 * @returns the competition containing the teams and the contests
 */
async function fetch(input) {
    const responses = await Promise.all([
        api.fetchLeague(input.apiId, input.season),
        api.fetchTeams(input.apiId, input.season),
        api.fetchMatches(input.apiId, input.season),
        api.fetchGroups(input.apiId, input.season),
        api.fetchRounds(input.apiId, input.season),
    ]);
    return buildCompetition(
        ...responses
    );
}

/**
 * 
 * @param {Array<Object>} leagueResponse 
 * @param {Array<Object>} teamsResponse 
 * @param {Array<Object>} matchesResponse 
 * @param {Array<Object>} groupsResponse 
 * @param {Array<Object>} roundsResponse 
 * @return {Competition}
 */
function buildCompetition(leagueResponse, teamsResponse, matchesResponse, groupsResponse, roundsResponse) {
    const leagueData = leagueResponse.response[0];
    const teamsBinaryTree = _teamsBinaryTree(groupsResponse.response, teamsResponse.response);
    console.debug('ptest tree %s', JSON.stringify(teamsBinaryTree.root().getValue()));
    console.debug('ptest tree %s', JSON.stringify(teamsBinaryTree.root().getLeft().getValue()));
    console.debug('ptest tree %s', JSON.stringify(teamsBinaryTree.root().getRight().getValue()));
    console.debug('ptest tree %s', JSON.stringify(teamsBinaryTree.root().getLeftHeight()));
    console.debug('ptest tree %s', JSON.stringify(teamsBinaryTree.root().getRightHeight()));
    const confrontations = matchesResponse.response.map(
        (match) => _footballConfrontation(teamsBinaryTree, match)
    );
    const season = leagueData.seasons[0];
    return {
        season: leagueData.seasons[0].year,
        startAt: new Date(season.start),
        endAt: new Date(season.end),
        currentRound: 0,
        rounds: roundsResponse.response,
        confrontations: confrontations
    }
}

/**
 * Creates a binary tree containing all teams with code and group
 * @param {Array<Object>} groupsResponse api response containing the groups
 * @param {Array<Object>} teamsResponse tree of teams without group
 * @return {AvlTree<Object>} tree of teams including the group
 */
function _teamsBinaryTree(groupsResponse, teamsResponse) {
    const teamsBinaryTree = new AvlTree((a, b) => a.id - b.id);
    const standings = groupsResponse[0].league.standings;
    const flatStandings = [].concat.apply([], standings);
    const sortedFlatStandings = flatStandings.sort((a, b) => a.team.id - b.team.id);
    const sortedTeamsWithCode = teamsResponse.sort((a, b) => a.team.id - b.team.id);
    console.debug('sortedFlatStandings $s', JSON.stringify(sortedFlatStandings.map((t) => t.team.id)));
    console.debug('sortedTeamsWithCode $s', JSON.stringify(sortedTeamsWithCode.map((t) => t.team.id)));
    sortedTeamsWithCode.forEach((teamHolder, index) => {
        const team = teamHolder.team;
        teamsBinaryTree.insert({
            id: team.id,
            code: team.code,
            logo: team.logo,
            group: sortedFlatStandings[index].group,
        });
    });
    return teamsBinaryTree;
}

/**
 * Receives the match from API and maps it to our model.
 * 
 * Once the match structure from API has home and away teams without the code, used in the logic team Id definition,
 * I need to search in the current teams list 
 * @param {BinarySearchTree<Object>} teamsBinaryTree the binary search structure to find teams by id
 * @param {Object} match the match from API
 * @returns {Confrontation} the match structure
 */
function _footballConfrontation(teamsBinaryTree, match) {
    const fixture = match.fixture;
    console.debug('match %s', JSON.stringify(match));
    const home = teamsBinaryTree.find(match.teams.home).getValue();
    const away = teamsBinaryTree.find(match.teams.away).getValue();
    const round = match.league.round;
    return {
        expectedDuration: 90,
        startAt: new Date(fixture.date),
        allowBetsUntil: new Date(fixture.date),
        round: round,
        group: home.group,
        contests: FootballMatch.Factory(
            { code: home.code, logo: home.logo },
            { code: away.code, logo: away.logo }
        ),
    }
}

module.exports = {
    fetch
}