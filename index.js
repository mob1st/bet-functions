require('dotenv').config()
const {Firestore} = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');
const axios = require('axios').default
const db = new Firestore();
/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('bet-leagues', async (_req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/teams',
        params: { league: '1', season: '2022' },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };
    try {
        const apiResponse = await axios.request(options);        
        const dbResponse = await db.collection('leagues').add(apiResponse.data);
        return res.status(200).send(dbResponse);
    } catch (e) {
        console.error(e);
        return res.status(500).send({error: 'some error happens'});
    }
});

function Country() {
    
}

functions.http('odds', (req, res) => {
    res.status(500).send();
})

functions.http('matches', (req, res) => {
    res.status(500).send();
})

functions.http('players'), (req, res) => {
    res.send();
}

functions.http('countries'), (req, res) => {

}

functions.http('leagues'), (req, res) => {

}

function rapidApiToFirebase(league) {
    const teams = league.data.countr.data.array.forEach(element => {
        
    });
    return {
        apiId: apiResponse.config.id,
        name: {
            description: 'World Cup',
            resId: 'api_league_world_cup_name'
        },                    
        firstMatchDate: Date(),
        finalDate: Date(),
        type: 'CUP',        
        teams: [
            {
                name: 'api_team_' + apiResponse.data.country.code,
                nameResId: 'api_team_' + apiResponse.data.country.code,
                                
            }, {

            }, {

            }, {

            }
        ],
    };    
}

function mapTeamResponse(teams) {
    return teams.map(team => {
        return {
            name: {
                description: 'Brazil',
                resId: 'api_team_'
            }
        }
    });
}