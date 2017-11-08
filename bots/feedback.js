'use strict';

var Bot = require('./bot');

module.exports = class Feedback extends Bot {
    constructor (id, submit) {
        super('feedback', id, submit);
    }

    // feedback bot doesn't read messages
    consult (msg) {}
};