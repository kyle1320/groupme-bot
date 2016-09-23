'use strict';

var Bot = require('./bot');

module.exports = class Harambe extends Bot {
    constructor (id) {
        super('harambe', id);
    }

    consult (msg) {
        var responses = [];

        if (msg.name && msg.name.match(/harambe/i)) {
            responses.push(this.makeMessage('Harambe lives!'));
        }

        if (msg.text && msg.text.match(/harambe/i)) {
            responses.push(this.makeMessage('Dicks out for Harambe!'));
        }

        return responses;
    }
};