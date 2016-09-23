'use strict';

var Bot = require('./bot');

module.exports = class Harambe extends Bot {
    constructor (id) {
        super('harambe', id);
    }

    consult (msg) {
        if (msg.text && msg.text.match(/harambe/i)) {
            return this.makeMessage('Dicks out for Harambe!');
        }

        if (msg.name && msg.name.match(/harambe/i)) {
            return this.makeMessage('Harambe lives!');
        }
    }
};