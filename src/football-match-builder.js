const { Duo, Node } = require('./common-data');
const { OddsType, Bet } = require('./bet-entities');
const { Duel, MultipleChoice } = require('./contest-entities');

/**
 * Creates a {@link Node} containing a duel and the scores of the duel
 * @param {Duo} teams the teams that will play against each other
 * @returns {Node} returns the structure of bets for a duel between two teams
 */
function createDuelNode(teams) {
    const properties = betsForTeams(teams);
    const duel = new Duel();
    Object.assign(duel, properties);
    return {
        current: duel,
        paths: betsForScores(),
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
            value: 1
        },
        subject: team,
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
            value: 1
        },
        subject: 'DRAW'
    }
}

/**
 * @returns {Array<Node>}
 */
function betsForScores() {
    return [
        { current: propertiesForMultiChoice(scoresForWinner()), paths: [] },
        { current: propertiesForMultiChoice(scoresForWinner()), paths: [] },
        { current: propertiesForMultiChoice(scoresForDraw()), paths: [] }
    ]
}

function propertiesForMultiChoice(properties) {
    const multiChoice = new MultipleChoice();
    Object.assign(multiChoice, properties);
    return multiChoice;
}

/**
 * @returns {MultipleChoice}
 */
function scoresForWinner() {
    return {
        contenders: [
            betForScore({ first: 1, second: 0 }),
            betForScore({ first: 2, second: 0 }),
            betForScore({ first: 2, second: 1 }),
        ]
    }
}

/**
 * 
 * @returns {MultipleChoice}
 */
function scoresForDraw() {
    return {
        contenders: [
            betForScore({ first: 0, second: 0 }),
            betForScore({ first: 1, second: 1 }),
            betForScore({ first: 2, second: 2 }),
        ]
    }
}

/**
 *  
 * @param {Duo} scores
 * @returns {Bet}
 */
function betForScore(scores) {
    return {
        odds: {
            type: OddsType.American,
            value: 1
        },
        subject: scores
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