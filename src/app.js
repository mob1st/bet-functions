require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { DownloadBatch, Downloadable, save } = require('./download-image');
const populateLeagueUseCase = require("./populate-leagues-usecase").call;

functions.http('bet-football', async (_req, res) => {
    try {
        const data = await populateLeagueUseCase();
        console.log('finish with success', JSON.stringify(data));
        return res.status(200)
        .contentType('application/json')
        .send(data);
    } catch (e) {        
        console.error('some error happens on popuplate football-league data', e);
        return res.status(500).send(_jsonError(e));
    }
});

functions.http('image-downloader', async (_req, res) => {
    try {        
        const downloadables = [
            new Downloadable('https://product-images-qa.qa-getmayd.com/img/banners/production/en-us/fallback/homescreen_top_4.png', 'first.png'),
            new Downloadable('https://product-images-qa.qa-getmayd.com/img/banners/production/v2/home/EN/en_vomex.png', 'second.png'),
            new Downloadable('https://product-images-qa.qa-getmayd.com/img/banners/production/de-de/homescreen_top_welcomevoucher.png', 'third.png'),
            new Downloadable('https://product-images-qa.qa-getmayd.com/img/banners/production/v2/home/DE/de_hexal_kopfschmerzen.png', 'fourth.png')        
        ];
        const batch = new DownloadBatch("sample", downloadables);
        await save(batch);
        console.log('finish request');
        return res.status(200).send({message: 'finish with success'});
    } catch(e) {
        console.error('some error happens on popuplate league data', e);
        return res.status(500).send(_jsonError(e));
    }
});

function _jsonError(e) {
    return JSON.stringify(e, Object.getOwnPropertyNames(e));
}