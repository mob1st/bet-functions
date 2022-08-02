const repository = require("./league-repository");

async function call() {
    console.log('populate-leagues-usecase.call: triggering repo');
    return await repository.populateWorldCup();
}

module.exports = {
    call
}