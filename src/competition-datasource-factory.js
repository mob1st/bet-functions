const footballDataSource = require('./football-competition-datasource');
const { CompetitionType } = require('./competition-entities');
const { ServerError, ErrorCode } = require('./server-error');

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
            throw new ServerError(ErrorCode.INVALID_COMPETITION_TYPE, `competition type is not allowed: ${input.type}`);
    }
}

module.exports = {
    createDataSource
}