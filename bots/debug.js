'use strict';

const Bot = require('./bot');
const BotGroup = require('./botgroup');

module.exports = class Debug extends Bot {
    constructor (id, options) {
        super('debug', id, options, {
            bots: new BotGroup()
        });

        this.bots = this.options.bots.clone()

        this.bots.on(
            'message',
            msg => this.post(msg.botName + ': ' + msg.text, msg.imageUrl)
        );
    }

    consult (msg) {
        this.bots.consultAll(msg);
    }
};