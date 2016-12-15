'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Bot = require('./bots/bot');

module.exports = BotRunner;

// A BotRunner listens for POST requests and calls the bots registered to it.
function BotRunner() {
    this.bots = new Map();

    var self = this;

    this.app = new express();
    this.app.use(bodyParser.json());
    this.app.post('/:botName', function(req, res) {
        if (self.preprocess(req)) {
            var botName = req.params.botName;

            if (self.bots.has(botName)) {
                var bot = self.bots.get(botName);

                bot.consult(req.body);
            }
        }

        res.end();
    });
}

// processes the given request and determines whether it should
// go to a bot. Returns true if the request is bot-worthy, false otherwise.
BotRunner.prototype.preprocess = function(req) {
    if (typeof req !== 'object') return false;
    if (typeof req.body !== 'object') return false;
    if (typeof req.body.text !== 'string') return false;

    // make sure we don't get any infinite bot loops...
    if (req.body.sender_type === 'bot') {
        return false;
    }

    return true;
};

// register a new bot
BotRunner.prototype.addBot = function(bot) {
    if (!(bot instanceof Bot)) {
        throw new TypeError('bot must be an instance of the Bot class');
    }

    this.bots.set(bot.name, bot);
};