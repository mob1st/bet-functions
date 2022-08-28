const footballDataSource = require('./football-competition-datasource');

/**
 * Each type of competition can have a different competition datasource handler.
 * This method creates the corresponding datasource for the given competition.
 * @param {CompetitionInput} input the competition used as reference
 * @returns the competition provided by datasources
 */
function createDataSource(input) {
    switch (input.type) {
        case CompetitionType.Football:
            return footballDataSource;
        default:
            throw new ServerError(Errors.INVALID_COMPETITION_TYPE, `competition type is not allowed: ${input.type}`);
    }
}

const CompetitionType = {
    Football: 'FOOTBALL'
}

module.exports = {
    createDataSource
}