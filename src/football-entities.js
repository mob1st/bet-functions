const { Duel } = require("./contest-entities");
const builder = require("./football-match-builder");


class FootballMatch extends Duel {

    /**     
     * @param {Team} home 
     * @param {Team} away 
     * @returns {Node}
     */
    static Factory(home, away) {
        return builder.createDuelNode({
            first: home,
            second: away
        });
    }
}

class Team {
    constructor(code, logo) {
        this.code = code;
        this.logo = logo;
    }

    fileName() {
        return 'fileName';
    }

    name() {
        return 'teammmm';
    }
}

module.exports = {
    FootballMatch,
    Team
}
