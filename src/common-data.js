/**
 * Default structure used bny clients for localized text
 */
class Localized {

    /**
     * 
     * @param {String} value original value returned from the data source. typically it's an word in english
     * @param {String} resId the resource id used by the clients to get the localized value
     */
    constructor(value, resId) {
        this.value = value;
        this.resId = resId;
    };
}

module.exports = {
    Localized,
}