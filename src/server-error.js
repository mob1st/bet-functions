const ErrorCode = {
    INVALID_COMPETITION_TYPE: 1000,
}

/**
 * Indicates a server error that triggers a http status code 500
 */
class ServerError extends Error {

    /**    
     * @param {Number} code the code to identify the error. Should be one of the codes available in {@link ErrorCode}
     * @param {String} message the message to facilitate the debug describing what happens
     */
    constructor(code, message) {
        super('Server Error', message);
        this.code = code;
    }

    toJSON() {
        return {
            code: this.code,
            name: this.name,
            message: this.message
        }
    }
}

module.exports = {
    ServerError
}