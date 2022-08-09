const path = require('path');
const axios = require('axios').default;
const { storage }  = require('./firebase-setup');

const images = [
    "https://product-images-qa.qa-getmayd.com/img/banners/production/en-us/fallback/homescreen_top_4.png",
    "https://product-images-qa.qa-getmayd.com/img/banners/production/v2/home/EN/en_vomex.png",    
    "https://product-images-qa.qa-getmayd.com/img/banners/production/de-de/homescreen_top_welcomevoucher.png",
    "https://product-images-qa.qa-getmayd.com/img/banners/production/v2/home/DE/de_hexal_kopfschmerzen.png"
];

function listOfImages() {
    return Promise.all(images.map(link => axiosDownload(link, './chupchupZ/')));
}

async function axiosDownload(link, filesFolder) {
    const fileName = path.parse(new URL(link).pathname).base;    
    const bucket = storage.bucket();
    const writer = bucket.file(path.join(filesFolder, fileName));
    const response = await axios({
        url: link,
        method: 'GET',
        responseType: 'stream'
    });
    
    const result = response.data.pipe(writer.createWriteStream());
    result.on('finish', async () => {        
        console.log('image deployed', fileName);
        await writer.makePublic();        
        console.log(
            'bucket name', 
            bucket.name, 
            await writer.isPublic(), 
            await writer.publicUrl()
        );
    });
    result.on('error',(e) => {
        console.error('error received', e, fileName);
        throw e;
    });        
}

module.exports = {
    listOfImages
}