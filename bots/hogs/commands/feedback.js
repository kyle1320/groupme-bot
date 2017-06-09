'use strict';

const request = require('request');

const key = process.env.MAKER_WEBHOOKS_KEY;
const url = 'https://maker.ifttt.com/trigger/groupme_feedback/with/key/' + key;

module.exports = function (args, msg) {
    if (!args.length) return;

    var data = {
        value1: msg.name,
        value2: args.join(' ')
    };

    return new Promise(function (resolve, reject) {
        request.post(
            url,
            { json: data },
            function (err, response, body) {
                if (err) reject('Sorry, your feedback was not sent.');
                else     resolve('Feedback sent. Thanks!');
            }
        );
    });
}

module.exports.helpString =
`Sends feedback to the creator (Kyle Cutler).
Usage: !feedback message
where message is the feedack you want to send.`;