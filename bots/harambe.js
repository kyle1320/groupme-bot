'use strict';

var Bot = require('./bot');

module.exports = class Harambe extends Bot {
    constructor (id) {
        super('harambe', id);
    }

    consult (msg) {
        if (msg.name && msg.name.match(/harambe/i)) {
            this.post('Harambe lives!');
        }

        if (msg.text && msg.text.match(/harambe/i)) {
            this.post('Dicks out for Harambe!');
        }
    }
};