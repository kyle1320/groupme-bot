'use strict';

const groupmeServices = require('../../../groupme-services');

const FEEDBACK_BOT_ID = process.env.FEEDBACK_BOT_ID;

module.exports = function (args, msg) {
    if (!args.length) return;

    groupmeServices.postBotMessage({
        bot_id: FEEDBACK_BOT_ID,
        text: msg.name + ': ' + args.join(' ')
    });

    return 'Feedback sent. Thanks!';
}

module.exports.helpString =
`Sends feedback to the creator (Kyle Cutler).
Usage: !feedback message
where message is the feedack you want to send.`;