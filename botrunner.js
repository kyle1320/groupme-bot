const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

module.exports = BotRunner;

// A BotRunner listens for POST requests, forwards them to bots registered
// under it, and submits their responses to a given function.
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
    this.app.post('/:botName', function(req, res) {
        if (self.preprocess(req)) {
            var botName = req.params.botName;

            if (self.bots.has(botName)) {
                var bot = self.bots.get(botName);

                self.consult(bot, req);
            }
        }

        res.end();
    });
};

// consults the given bot using the given request, and processes the message
// if one is returned.
BotRunner.prototype.consult = function(bot, req) {
    if (typeof req !== 'object') return;
    if (typeof req.body !== 'object') return;
    if (typeof req.body.text !== 'string') return;

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

// forms the GroupMe-compatible object and calls the submit function with it.
BotRunner.prototype.say = function(msg, bot) {
    if (typeof msg !== 'object') return;
    if (typeof bot !== 'object') return;

    var body = {
        'bot_id': bot.id,
        'text': msg.text
    };

    if (this.options.debug) {
        console.log('response', msg, 'from ' + bot.name);

        // if debugging, use the debug bot ID and say which bot
        // the message is coming from.
        body.bot_id = this.options.debugBotId;
        body.text = bot.name + ': ' + body.text;
    }

    this.submit(body);
};

// opens the server
BotRunner.prototype.listen = function(port) {
    this.server = this.app.listen(port || 3000);
};

// closes the server
BotRunner.prototype.close = function() {
    if (this.server) {
        this.server.close();
        this.server = null;
    }
}