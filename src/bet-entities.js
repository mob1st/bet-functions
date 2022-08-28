const OddsType = {
    American: 'AMERICAN',
    Decimal: 'DECIMAL'
}

/**
 * A bet
 */
class Bet {

    /**
     * 
     * @param {Odds} odds the odds payed if the subject under bet happens
     * @param {Object} subject The subject under bet
     */
    constructor(odds, subject) {
        this.odds = odds;
        this.subject = subject;
    }
}

/**
 * Odds indicates the probability of something happens.
 * 
 * It's used by {@link Bet} to determine the value of guess that something can happen
 */
class Odds {

    /**     
     * @param {String} type the type of odds. Use one of the {@link OddsType}
     * @param {any} value the value of this odds. it's typically a number
     */
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

module.exports = {
    OddsType,
    Odds,
    Bet
}