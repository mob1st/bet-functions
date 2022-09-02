const { PUBLIC_STORAGE_URL } = require("./firebase-setup");
const { Team } = require('./football-entities');

/**
 * Creates the structure to be saved in the firebase file 
 * @param {Team} contender
 */
function contenderDto(contender) {
    return {
        code: contender.code,
        name: contender.name,
        apiId: contender.apiId,
        url: `${PUBLIC_STORAGE_URL}/${contender.fileName}`,
    }
}

module.exports = {
    contenderDto
};