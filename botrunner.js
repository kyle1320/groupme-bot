'use strict';

const express = require('express');
const bodyParser = require('body-parser');

module.exports = botRunner;

// A BotRunner listens for POST requests and calls the bots registered to it.
function botRunner(...botList) {
    var bots = new Map();
    var router = new express.Router();

    botList.forEach(function (bot) {
        bots.set(bot.name, bot);
    });

    router.use(bodyParser.json());
    router.post('/:botName', function(req, res) {
        if (preprocess(req)) {
            var botName = req.params.botName;

            if (bots.has(botName)) {
                var bot = bots.get(botName);

                bot.consult(req.body);
            }
        }

        res.end();
    });

    return router;
}

// processes the given request and determines whether it should
// go to a bot. Returns true if the request is bot-worthy, false otherwise.
function preprocess(req) {
    if (typeof req !== 'object') return false;
    if (typeof req.body !== 'object') return false;
    if (typeof req.body.text !== 'string') return false;

    // make sure we don't get any infinite bot loops...
    if (req.body.sender_type === 'bot') {
        return false;
    }

    return true;
}