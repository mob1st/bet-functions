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
     * @param {Array<Node>} paths 
     */
    constructor(current, paths) {
        this.current = current;
        this.paths = paths;
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
    return url
        .split(/[#?]/)[0]
        .split('.')
        .pop()
        .trim();
}

module.exports = {
    Duo,
    Node,
    shortIsoToDate,
    getUrlExtension
}