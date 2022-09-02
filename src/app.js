require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const createCompetitionUseCase = require('./create-competition-usecase');
const { ServerError } = require('./server-error');

functions.http('bet-football', async (req, res) => {
    try {
        assertHttpMethod(req);
        const data = await createCompetitionUseCase.call(req.body);
        return res.status(200).contentType('application/json').send(data).end();
    } catch (e) {
        const errorResponse = handleError(e);
        return res.status(errorResponse.statusCode)
            .contentType('application/json')
            .send(JSON.stringify(errorResponse.body))
            .end();
    }
});

function assertHttpMethod(req) {
    if (req.method != 'POST') {
        throw InvalidHttpMethod(req.method);
    }
}

/**
 * 
 * @param {Error} e 
 * @returns {Object}
 */
function handleError(e) {
    let body;
    let statusCode = 500;
    console.error('handling error %s', e);
    switch (true) {
        case e instanceof InvalidHttpMethodError:
            console.log('invalid http error');
            body = e.toJSON();
            statusCode = 405;
            break;
        case e instanceof ServerError:
            console.log('server error');
            body = e.toJSON()
            break;
        default:
            console.log('different error');
            body = {
                message: e.message,
                name: 'Unknown Error'
            };
            break;
    }
    return {
        statusCode: statusCode,
        body: body,
    }
}

class InvalidHttpMethodError extends Error {
    constructor(method) {
        super('Invalid Method', `Http method not allowed`);
        this.method = method;
    }

    toJSON() {
        return {
            message: this.message,
            method: this.method,
        };
    }
}