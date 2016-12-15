'use strict';

const https = require('https');

var botPostRequestOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

module.exports.postBotMessage = function (msg) {
    var req = https.request(botPostRequestOptions);
    req.end(JSON.stringify(msg));
};