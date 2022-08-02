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

    toJSON() {
        return {
            value: this.value,
            resId: this.resId,
        }
    }
}

/**
 * Converts the given string date in the format YYYY-mm-dd to a Date instance
 * @param {String} strDate the string date to be formatted 
 */
function shortIsoToDate(strDate) {
    const [year, month, day] = strDate.split('-');
    return Date(year, month-1, day);
}

module.exports = {
    Localized,
    shortIsoToDate,
}