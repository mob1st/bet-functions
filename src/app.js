const functions = require('@google-cloud/functions-framework');
const populateLeagueUseCase = require("./populate-leagues-usecase").call;
const listOfImages = require("./download-image").listOfImages;

functions.http('bet-football', async (_req, res) => {
    try {
        const data = await populateLeagueUseCase();
        console.log('finish with success', JSON.stringify(data));
        return res.status(200).send(data);
    } catch (e) {        
        console.error('some error happens on popuplate football-league data', e);
        return res.status(500).send(_jsonError(e));
    }
});

functions.http('image-downloader', (_req, res) => {
    try {
        listOfImages();
        return res.status(200).send({message: 'finish with success'});
    } catch(e) {
        console.error('some error happens on popuplate league data', e);
        return res.status(500).send(_jsonError(e));
    }
});

function _jsonError(e) {
    return JSON.stringify(e, Object.getOwnPropertyNames(e));
}