'use strict';

var Bot = require('./bot');

module.exports = class Feedback extends Bot {
    constructor (id) {
        super('feedback', id);
    }

    // feedback bot doesn't read messages
    consult (msg) {}
};