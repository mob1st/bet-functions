const https = require('https');

const { pipeline } = require('stream');
const { createWriteStream } = require('fs');
const path = require('path');
const axios = require('axios').default;

const images = [
    "https://product-images-qa.qa-getmayd.com/img/banners/production/en-us/fallback/homescreen_top_4.png",
    "https://product-images-qa.qa-getmayd.com/img/banners/production/v2/home/EN/en_vomex.png"
];
function downloadAndUpload() {
    const downloadFile = (link, filesFolder) => {
        return new Promise((resolve , reject) => {
            console.log('init download', link);
            
            const request = https.get(link, (response)  => {
                console.log('image downloaded', response.statusCode, response.headers);
                const fileName = path.parse(new URL(link).pathname).base;
                
                const file = createWriteStream(path.join(filesFolder, fileName));
                console.log('saving file', file.path);
                pipeline(response, file, () => {
                    console.log('finish image operation');
                    file.close();
                    resolve();
                });
            });

            request.on('error', (e) => {
                console.error('image loading failed', e, link);
                reject(e);
            });
        });
    }

    return Promise.all(images.map(link => downloadFile(link, './chupchup/')));
}

function listOfImages() {
    return Promise.all(images.map(link => axiosDownload(link, './chupchupZ/')));
}

async function axiosDownload(link, filesFolder) {
    const fileName = path.parse(new URL(link).pathname).base;
    const writer = createWriteStream(path.join(filesFolder, fileName));
    const response = await axios({
        url: link,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

module.exports = {
    downloadAndUpload,
    listOfImages
}