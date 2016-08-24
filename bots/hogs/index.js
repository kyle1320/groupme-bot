'use strict';

const Bot = require('../bot');
const commands = require('./commands');

module.exports = class HogsBot extends Bot {
    constructor(id) {
        super('hogs', id);
    }

    consult(msg) {

        // if the message text begins with ! or /, interpret it as a command
        if (/^[!\/]/.test(msg.text)) {

            // split arguments by whitespace
            var args = msg.text.substring(1).split(/\s+/);
            var cmd = args.splice(0, 1)[0];

            if (cmd in commands) {
                var self = this;

                return Promise.resolve(commands[cmd](args))
                    .then(function(text) {
                        if (text) {

                            // insert > to make text quoted / monospace
                            return self.makeMessage('>' + text);
                        }
                    });
            }
        }
    }
}