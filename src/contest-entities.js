const { Bet } = require('./bet-entities');

/**
 * When two contenders face each other and the user can bet in one of them to decide the winner
 */
class Duel {

    /**     
     * @param {Bet} contender1 the bet for the first contender
     * @param {Bet} contender2 the bet for the second contender
     * @param {Bet} draw if the {@link Competition} allow draw for this {@link Confrontation} this value is not null
     */
    constructor(contender1, contender2, draw) {
        this.contender1 = contender1;
        this.contender2 = contender2;
        this.draw = draw;
    }
}

/**
 * When the user has multiple choices and have to choose one
 */
class MultipleChoice {

    /**
     * 
     * @param {Array<Bet>} contenders all bet contenders
     */
    constructor(contenders) {
        this.contenders = contenders;
    }

}
module.exports = {
    Duel,
    MultipleChoice
}