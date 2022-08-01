const repository = require("./league-repository");

async function call() {
    return await repository.populateWorldCup();
}

module.exports = {
    call    
}