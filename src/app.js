const functions = require('@google-cloud/functions-framework');
const populateLeagueUseCase = require("./populate-leagues-usecase").call;

functions.http('bet-football', async (_req, res) => {
    try {
        const data = await populateLeagueUseCase();
        console.log('finish with success', JSON.stringify(data));
        return res.status(200).send(data);
    } catch (e) {
        console.log('some error happens on popuplate data', e);
        return res.status(500).send(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    }
});