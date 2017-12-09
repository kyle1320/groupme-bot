'use strict';

const Bot = require('./bot');
const BotGroup = require('./botgroup');

module.exports = class Debug extends Bot {
    constructor (id, options) {
        super('debug', id, options);

        this.bots = new BotGroup(
            ...require('.')
                .filter(BotClass => BotClass != Debug)
                .map(BotClass => new BotClass(id))
        );

        this.bots.on(
            'message',
            msg => this.post(msg.botName + ': ' + msg.text, msg.imageUrl)
        );
    }

    consult (msg) {
        this.bots.consultAll(msg);
    }
};