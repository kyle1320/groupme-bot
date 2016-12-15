'use strict';

var Bot = require('./bot');

module.exports = class Debug extends Bot {
    constructor (id, submit) {
        super('debug', id, function(msg) {
            msg.text = this.name + ': ' + msg.text;
            submit(msg);
        });

        var self = this;

        this.bots = require('.').filter(function (BotClass) {
            return BotClass != Debug;
        }).map(function (BotClass) {
            return new BotClass(self.id, self.submit);
        });
    }

    consult (msg) {
        this.bots.forEach(function (bot) {
            bot.consult(msg);
        });
    }
};