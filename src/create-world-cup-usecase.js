const repository = require("./league-repository");
const { League } = require('./league');

async function call() {
    console.log('populate-leagues-usecase.call: triggering repo');
    const league = await repository.create(League.WorldCup, 2022);
    return league;
}

module.exports = {
    call
}