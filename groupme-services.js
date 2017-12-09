'use strict';

const https = require('https');
const request = require('request-promise-native')

var botPostRequestOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

// bot message posting
// msg is a bot message object.
module.exports.postBotMessage = function (msg) {
    var req = https.request(botPostRequestOptions);
    var groupmeMessage = {
        bot_id: msg.botId,
        text: msg.text
    };

    if (msg.imageUrl) {
        groupmeMessage.picture_url = msg.imageUrl;
    }

    req.end(JSON.stringify(groupmeMessage));
};

// GroupMe image hosting upload
module.exports.uploadImagePNG = async function (image, groupmeApiToken) {
    var res = await request({
        method: 'POST',
        uri: 'https://image.groupme.com/pictures',
        headers: {
        'X-Access-Token': groupmeApiToken,
        'Content-Type': 'image/png'
        },
        body: image
    });

    return JSON.parse(res).payload.picture_url
}
