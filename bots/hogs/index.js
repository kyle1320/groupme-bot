'use strict';

const Bot = require('../bot');
const commands = require('./commands');
const FeedbackBot = require('../feedback');

module.exports = class HogsBot extends Bot {
    constructor (id, options) {
        super('hogs', id, options);

        // re-emit any messages emitted by the feedback bot
        var self = this;
        this.options.feedbackBot = new FeedbackBot(this.options.feedbackBotId);
        this.options.feedbackBot.on('message', function (...args) {
            self.emit('message', ...args);
        });
    }

    post (msg) {
        if (!msg) return;

        super.post('>' + msg); // insert > to make text quoted / monospace
    }

    consult (msg) {

        // support for timestamps
        if (/^\d/.test(msg.text)) {
            msg.text = msg.text.substring(msg.text.indexOf(' ') + 1);
        }

        // if the message text begins with ! or /, interpret it as a command
        if (/^[!\/]/.test(msg.text)) {

            // split arguments by whitespace
            var args = msg.text.trim().substring(1).split(/\s+/);
            var cmd = args.splice(0, 1)[0].toLowerCase();

            if (cmd in commands) {
                var result = commands[cmd](args, msg, this.options);

                if (result instanceof Promise) {
                    result
                        .catch(function (err) {
                            console.log(err);
                            return 'Sorry, something went wrong.';
                        }).then(this.post.bind(this));
                } else {
                    this.post(result);
                }
            }
        }
    }
}