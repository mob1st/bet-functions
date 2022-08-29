const { Node } = require("./common-data");
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
    constructor(code, name, logo) {
        this.code = code;
        this.logo = logo;
        this.name = name;
    }

    toJSON() {
        return {
            code: this.code,
            logo: this.code,
            name: this.name
        };
    }
}

module.exports = {
    FootballMatch,
    Team
}
