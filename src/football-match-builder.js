const { Duo, Node } = require('./common-data');
const { OddsType, Bet } = require('./bet-entities');
const { Duel, MultipleChoice } = require('./contest-entities');

/**
 * Creates a {@link Node} containing a duel and the scores of the duel
 * @param {Duo} teams the teams that will play against each other
 * @returns {Node} returns the structure of bets for a duel between two teams
 */
function createDuelNode(teams) {
    return {
        current: betsForTeams(teams),
        next: betsForScores(teams),
    }
}

/**
 * 
 * @param {Duo} teams 
 * @returns {Duel}
 */
function betsForTeams(teams) {
    return {
        contender1: betForTeam(teams.first),
        contender2: betForTeam(teams.second),
        draw: betForDraw(teams),
    };
}

/**
 * 
 * @param {Object} team 
 * @returns {Bet}
 */
function betForTeam(team) {
    return {
        odds: {
            type: OddsType.American,
            value: 0
        },
        subject: team
    };
}

/**
 * 
 * @returns {Bet}
 */
function betForDraw() {
    return {
        odds: {
            type: OddsType.American,
            value: 0
        },
    }
}

/**
 * 
 * @param {Duo} teams 
 * @returns {Array<Node>}
 */
function betsForScores(teams) {
    return [
        { current: scoresForTeam(teams.first, teams.second), },
        { current: scoresForTeam(teams.second, teams.first) },
        { current: scoresForDraw(teams) }
    ]

}

/**
 * 
 * @param {Team} winner
 * @param {Team} loser
 * @returns {MultipleChoice}
 */
function scoresForTeam(winner, loser) {
    return {
        contenders: [
            betForScore(
                { first: winner, second: loser },
                { first: 1, second: 0 },
            ),
            betForScore(
                { first: winner, second: loser },
                { first: 2, second: 0 },
            ),
            betForScore(
                { first: winner, second: loser },
                { first: 2, second: 1 },
            ),
        ]
    }
}

/**
 * 
 * @param {Duo} teams 
 * @returns {Array<Bet>}
 */
function scoresForDraw(teams) {
    return [
        betForScore(teams, { first: 0, second: 0 }),
        betForScore(teams, { first: 1, second: 1 }),
        betForScore(teams, { first: 2, second: 2 }),
    ]
}

/**
 * 
 * @param {Duo} teams 
 * @param {Duo} scores
 * @returns {Bet}
 */
function betForScore(teams, scores) {
    return {
        odds: {
            type: OddsType.American,
            value: 0
        },
        subject: {
            first: scoreForContender(teams.first, scores.first),
            second: scoreForContender(teams.second, scores.second)
        }
    }
}

/**
 * @param {Team} contender 
 * @param {Number} score
 * @returns {ContenderScore}
 */
function scoreForContender(contender, score) {
    return {
        contenderId: contender.code,
        score: score
    }
}

module.exports = {
    createDuelNode
}