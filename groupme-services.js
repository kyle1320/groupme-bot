'use strict';

const https = require('https');
const request = require('request-promise-native')

var botPostRequestOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

if (process.env.NODE_ENV === 'production') {
    module.exports.postBotMessage = function (msg) {
        var req = https.request(botPostRequestOptions);
        req.end(JSON.stringify(msg));
    };
} else { // development mode. Messages are printed to console.
    module.exports.postBotMessage = function (msg) {
        console.log(JSON.stringify(msg));
    };
}

// GroupMe image hosting upload
module.exports.uploadImagePNG = async function (image) {
    var res = await request({
        method: 'POST',
        uri: 'https://image.groupme.com/pictures',
        headers: {
        'X-Access-Token': process.env.GROUPME_TOKEN,
        'Content-Type': 'image/png'
        },
        body: image
    });

    return JSON.parse(res).payload.picture_url
}
