const { File } = require('@google-cloud/storage');
const { Stream } = require('stream');
const path = require('path');
const axios = require('axios').default;
const { storage }  = require('./firebase-setup');

class DownloadBatch {

    /**
     * A batch download a list of files
     * 
     * The folderName will be used to save all the given downloadables
     * 
     * @param {String} folderName 
     * @param {Array<Downloadable>} downloadables 
     */
    constructor(folderName, downloadables) {
        this.folderName = folderName;
        this.downblodables = downloadables;        
    };
}

class Downloadable {

    /**
     * File to be downbloaded and uploaded
     * 
     * @param {String} url url of the file to be downloaded
     * @param {String} fileName destination file name to be created (or replaced)
     */
    constructor(url, fileName) {
        this.url = url;
        this.fileName = fileName;
    };
}

/**
 * Download a batch of files and save them in the given folder
 * 
 * @param {DownloadBatch} batch
 */
async function save(batch) {
    for (index = 0; index < batch.downblodables.length; index++) {
        console.log('1 create file on bucket', index+1,  batch.downblodables[index].url);
        await axiosDownload(batch.folderName, batch.downblodables[index]);
    }    
}

/**
 * 
 * @param {String} folderName the folder name
 * @param {Downloadable} downloadable the file to be downloaded
 * @returns {Promise<String>} the promise to provide the url name of the uploaded image
 */
async function axiosDownload(folderName, downloadable) {    
    const bucket = storage.bucket();
    const relativeFileName = path.join(folderName, downloadable.fileName);
    const file = bucket.file(relativeFileName);
    const response = await axios({
        url: downloadable.url,
        method: 'GET',
        responseType: 'stream'
    });
    await writeFile(response.data, file);
    await file.makePublic();    
    console.log('4 image is public', downloadable.fileName);
    return file.publicUrl();
}

/**
 * 
 * @param {Stream} data the downloaded response in stream
 * @param {File} file the file to be uploaded to firestore
 */
function writeFile(data, file) {
    return new Promise((resolve, reject) => {
        try {
            console.log('2 start upload', file.name);
            const result = data.pipe(file.createWriteStream());
            result.on('finish', () => {
                console.log('3 image deployed', file.name);
                resolve();
            });
    
            result.on('error',(e) => {
                console.error('error on write file', e, file.name);
                reject(e)
            });
        } catch (e) {
            console.error('error on upload file', e, file.name);
            reject(e);
        }        
    });
}

module.exports = {
    save,
    Downloadable,
    DownloadBatch
}