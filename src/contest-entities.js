const { Bet } = require('./bet-entities');

const MultipleChoiceType = {
    IntScores: 'INT_SCORES'
}

/**
 * When two contenders face each other and the user can bet in one of them to decide the winner
 */
class Duel {

    /**     
     * @param {Bet} contender1 the bet for the first contender
     * @param {Bet} contender2 the bet for the second contender
     * @param {Bet} draw if the {@link Competition} allow draw for this {@link Confrontation} this value is not null
     * @param {Any} scores the result of the duel
     */
    constructor(contender1, contender2, draw, scores) {
        this.contender1 = contender1;
        this.contender2 = contender2;
        this.draw = draw;
        this.scores = scores;
    }
}

/**
 * When the user has multiple choices and have to choose one
 */
class MultipleChoice {

    /**
     * @param {String} type the type of the {@link contenders}. Use one of the {@link MultipleChoiceType}
     * @param {Array<Bet>} contenders all bet contenders
     */
    constructor(type, contenders) {
        this.type = type;
        this.contenders = contenders;
    }

}
module.exports = {
    Duel,
    MultipleChoice,
    MultipleChoiceType
}