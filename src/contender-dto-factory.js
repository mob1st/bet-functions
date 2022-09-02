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
            console.log('invalid object: %s', JSON.stringify(contender));
            throw new ServerError(ErrorCode.INVALID_CONTENDER_TYPE, `invalid contender type for ${typeof contender}`);
    }
}

module.exports = {
    createDto
}