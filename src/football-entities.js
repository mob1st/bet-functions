const { Node, getUrlExtension } = require("./common-data");
const { Contender } = require("./competition-entities");
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

class Team extends Contender {
    constructor(apiId, code, name, logo, fileName, group) {
        super(apiId);
        this.code = code;
        this.name = name;
        this.logo = logo;
        this.fileName = fileName;
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
