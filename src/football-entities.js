const { Node, getUrlExtension } = require("./common-data");
const { Contender } = require("./competition-entities");
const { Duel } = require("./contest-entities");
const builder = require("./football-match-builder");


class FootballMatch extends Duel {

    /**     
     * @param {Team} home 
     * @param {Team} away 
     * @returns {Duel}
     */
    static Factory(home, away) {
        return builder.createDuel({
            first: home,
            second: away
        });
    }
}

class Team extends Contender {
    constructor(apiId, code, name, logo, fileName, group) {
        super(apiId, logo, fileName);
        this.code = code;
        this.name = name;
        this.group = group;
    }

    toJSON() {
        return {
            code: this.code,
            fileName: this.fileName,
            name: this.name,
        };
    }


}

module.exports = {
    FootballMatch,
    Team
}
