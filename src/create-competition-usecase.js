const factory = require('./competition-datasource-factory');
const { CompetitionInput } = require('./competition-entities');
const db = require('./competition-db');

/**
 * 
 * @param {Object} input
 */
async function call(body) {
    const input = await db.getInput(body.type, body.code, body.season);
    const datasource = factory.createDataSource(input);
    const competition = await datasource.fetch(input);
    await db.create(input, competition);
    return competition;
}

module.exports = {
    call
}