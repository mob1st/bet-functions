const factory = require('./competition-datasource-factory');
const task = require('./competition-image-task');
const db = require('./competition-db');

/**
 * 
 * @param {Object} input
 */
async function call(body) {
    const input = await db.getInput(body.type, body.code, body.season);
    const datasource = factory.createDataSource(input);

    console.info('loading competition %s of type $s from external data source', input.code, input.type);
    const competition = await datasource.fetch(input);

    console.info(
        'saving competition %s with %d contenders and %d confrontations in our database',
        competition.code,
        competition.contenders.length,
        competition.confrontations.length,
    );
    await db.create(input, competition);

    console.info('scheduling task to download the images');
    task.schedule(competition);

    return competition;
}

module.exports = {
    call
}