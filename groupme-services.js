'use strict';

const https = require('https');

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
