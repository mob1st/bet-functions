const factory = require('./competition-datasource-factory');
const { CompetitionInput } = require('./competition-entities');

/**
 * 
 * @param {CompetitionInput} input
 */
async function call(input) {
    const datasource = factory.createDataSource(input);
    return await datasource.fetch(input);
}

module.exports = {
    call
}