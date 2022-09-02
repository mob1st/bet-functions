const { ServerError, ErrorCode } = require('./server-error')
const footballDb = require('./football-contest-db');
const { Team } = require('./football-entities');

/**
 * 
 * @param {String} type 
 * @param {Object} contest
 * @returns {Object}
 */
function createDto(contender) {
    switch (true) {
        case contender instanceof Team:
            return footballDb.contenderDto(contender);
        default:
            throw ServerError(ErrorCode.INVALID_CONTENDER_TYPE, `invalid competition type for ${typeof contender}`);
    }
}

module.exports = {
    createDto
}