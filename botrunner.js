const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

// TODO: botHandler?

const harambe = require('./bots/harambe');
const artkalb = require('./bots/artkalb');

const DEBUG = process.env.BOT_DEBUG;

module.exports = BotRunner;

function BotRunner(submit) {
    if (typeof submit !== 'function') {
        throw new TypeError('submit must be a function');
    }

    this.submit = submit;

    this.app = express();

    this.app.use(bodyParser.json());

    this.app.post('/harambe', this.consult(harambe));
    this.app.post('/artkalb', this.consult(artkalb));

    this.app.listen(process.env.PORT || 3000);
};

BotRunner.prototype.consult = function(bot) {
    var self = this;

    return function(req, res) {
        if (DEBUG) {
            console.log('message', req.body, 'to ' + bot.name);
        }

        // make sure we don't get any infinite bot loops...
        if (req.body.sender_type !== 'bot') {
            if (self.botEnabled(bot)) {
                if (DEBUG) {
                    console.log(bot.name + ' received message');
                }

                var msg = bot.consult(req.body);

                if (msg) {
                    self.say(msg, bot);
                }
            }
        }

        res.end();
    };
};

BotRunner.prototype.botEnabled = function(bot) {
    return new RegExp(bot.name, 'gi').test(process.env.BOT_MODES);
};

BotRunner.prototype.say = function(msg, bot) {
    if (typeof msg !== 'object') return;
    if (typeof bot !== 'object') return;

    var body = {
        'bot_id': bot.id,
        'text': msg.text
    };

    if (DEBUG) {
        console.log('response', msg, 'from ' + bot.name);
        body.bot_id = process.env.DEBUG_BOT_ID;
    }

    this.submit(body);
};