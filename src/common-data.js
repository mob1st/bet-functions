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

class Duo {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}

class Node {

    /**
     * 
     * @param {Object} current 
     * @param {Array<Node>} next 
     */
    constructor(current, next) {
        this.current = current;
        this.next = next;
    }
}

/**
 * Converts the given string date in the format YYYY-mm-dd to a Date instance
 * @param {String} strDate the string date to be formatted 
 */
function shortIsoToDate(strDate) {
    const splitDate = strDate.split('-');
    return new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
}

/**
 * Returns the extension provided by the given URL
 * 
 * Given the examples:
 * - https://example.com/folder/file.jpg
 * - https://example.com/fold.er/fil.e.jpg?param.eter#hash=12.345
 * The return will be 'jpg'
 * @param {String} url 
 * @returns the extension of the file
 */
function getUrlExtension(url) {
    var sss = new Intl();
    return url
        .split(/[#?]/)[0]
        .split('.')
        .pop()
        .trim();
}

const Languages = {
    'a': 'pt-BR'
};

module.exports = {
    Localized,
    Duo,
    Node,
    shortIsoToDate,
    getUrlExtension
}