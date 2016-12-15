'use strict';

const Bot = require('../bot');
const commands = require('./commands');

module.exports = class HogsBot extends Bot {
    constructor (id, submit) {
        super('hogs', id, submit);
    }

    consult (msg) {

        // if the message text begins with ! or /, interpret it as a command
        if (/^[!\/]/.test(msg.text)) {

            // twim whitespace
            msg.text = msg.text.trim();

            // split arguments by whitespace
            var args = msg.text.substring(1).split(/\s+/);
            var cmd = args.splice(0, 1)[0].toLowerCase();

            if (cmd in commands) {
                var self = this;

                var result = commands[cmd](args);

                if (result instanceof Promise) {
                    return result.then(function (text) {
                        if (text) {

                            // insert > to make text quoted / monospace
                            self.post('>' + text);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                        self.post('>Sorry, something went wrong.');
                    });
                } else if (result) {

                    // insert > to make text quoted / monospace
                    self.post('>' + result);
                }
            }
        }
    }
}