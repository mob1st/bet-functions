const functions = require('@google-cloud/functions-framework');
const populateLeagueUseCase = require("./populate-leagues-usecase").call;

functions.http('bet-football', async (_req, res) => {
    try {
        const data = await populateLeagueUseCase();
        return res.status(200).send(data);
    } catch (e) {
        return res.status(500).send({ error: e });
    }
});