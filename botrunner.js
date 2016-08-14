const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

module.exports = BotRunner;

// submit is the function to be called when the bot says something.
// options is an object that may contain the following keys:
//   debug:         Whether to print debug messages, etc.
//   debugBotId:    The bot id to use when sending messages in debug mode.
//                  This overrides any default bot ids.
function BotRunner(submit, options) {
    if (typeof submit !== 'function') {
        throw new TypeError('submit must be a function');
    }

    // if options wasn't given, use a default object
    options = options || {
        debug: false,
        debugBotId: undefined
    };

    if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
    }

    this.submit = submit;
    this.options = options;
    this.bots = new Map();

    var self = this;

    this.app = express();

    this.app.use(bodyParser.json());

    this.app.post('/all', function(req, res) {
        if (self.preprocess(req)) {
            for (var bot of self.bots.values()) {
                self.consult(bot, req);
            }
        }

        res.end();
    });

    this.app.post('/:botname', function(req, res) {
        if (self.preprocess(req)) {
            var botname = req.params.botname;

            if (self.bots.has(botname)) {
                var bot = self.bots.get(botname);

                self.consult(bot, req);
            }
        }

        res.end();
    });
};

// consults the given bot using the given request.
BotRunner.prototype.consult = function(bot, req) {
    var msg = bot.consult(req.body);

    if (this.options.debug) {
        console.log(bot.name + ' received message, returned', msg);
    }

    if (msg) {
        this.say(msg, bot);
    }
};

// processes the given request and determines whether it should
// go to a bot. Returns true if the request is bot-worthy, false otherwise.
BotRunner.prototype.preprocess = function(req) {
    if (typeof req.body !== 'object') return false;

    if (this.options.debug) {
        console.log('message', req.body, 'to ' + req.url);
    }

    // make sure we don't get any infinite bot loops...
    if (req.body.sender_type !== 'bot') {
        return true;
    }

    return false;
};

// register a new bot
BotRunner.prototype.addBot = function(bot) {
    if (typeof bot !== 'object') {
        throw new TypeError('bot must be an object');
    }

    this.bots.set(bot.name, bot);
};

BotRunner.prototype.say = function(msg, bot) {
    if (typeof msg !== 'object') return;
    if (typeof bot !== 'object') return;

    var body = {
        'bot_id': bot.id,
        'text': msg.text
    };

    if (this.options.debug) {
        console.log('response', msg, 'from ' + bot.name);

        body.bot_id = this.options.debugBotId;
        body.text = bot.name + ': ' + body.text;
    }

    this.submit(body);
};

BotRunner.prototype.listen = function(port) {
    this.app.listen(port || 3000);
};