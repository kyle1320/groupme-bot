'use strict';

// Bots should extend this class and override consult().
module.exports = class Bot {

    // name is the path this bot will be acessible by
    // id is the bot ID to send to GroupMe
    constructor (name, id) {
        if (typeof name !== 'string') throw new TypeError('name must be a string!');
        if (typeof id !== 'string') throw new TypeError('id must be a string!');

        this.name = name;
        this.id = id;
    }

    consult (msg) {
        throw new Error('Subclass must implement consult()');
    }

    // Helper function to insert the given text into a
    // GroupMe-compatible message object and return it.
    makeMessage(text) {
        return {
            'bot_id': this.id,
            'text': text
        };
    }
}