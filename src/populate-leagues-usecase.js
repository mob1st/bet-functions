const repository = require("./league-repository");
const imageInvoker = require("./image-invoker");
const { League } = require('./league');

async function call() {
    const league = await repository.create(League.WorldCup, 2022);
    console.log('populate-leagues-usecase.call: triggering repo');
    const downloadBatch = _teamImageDownloadBatch(league);
    console.log('populate-leagues-usecase.call: triggering image downloader', downloadBatch);
    //await imageInvoker.invoke(downloadBatch, Date.now() / 1000);
    return league;
}

function _teamImageDownloadBatch(league) {
    const downloadables = league.teams.map((team) => { 
        return { 
            url: team.apiImage,
            fileName: team.fileName
        };
    });
    return {
        folderName: league.teamsFolderName,
        downloadables: downloadables
    };
}

module.exports = {
    call
}