'use strict';

const groupmeServices = require('../../../groupme-services');

module.exports = function (args, msg, options) {
    if (!args.length) return;

    var botId = options.feedbackBotId;

    groupmeServices.postBotMessage({
        bot_id: botId,
        text: msg.name + ': ' + args.join(' ')
    });

    return 'Feedback sent. Thanks!';
}

module.exports.helpString =
`Sends feedback to the creator (Kyle Cutler).
Usage: !feedback message
where message is the feedack you want to send.`;