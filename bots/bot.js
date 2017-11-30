'use strict';

const EventEmitter = require('events');
const message = require('./message');

// Bots should extend this class and override consult().
module.exports = class Bot extends EventEmitter {

    // name is the path this bot will be acessible by
    // id is the bot ID to send to GroupMe
    constructor (name, id) {
        super();

        if (typeof name !== 'string') throw new TypeError('name must be a string!');
        if (typeof id !== 'string') throw new TypeError('id must be a string!');

        this.name = name;
        this.id = id;
    }

    consult (msg) {
        throw new Error('Subclass must implement consult()');
    }

    post (text, img) {
        this.emit('message', message(this, text, img));
    }

    postDelayed (delay, text, img) {
        // don't let the timeout stop the program from halting
        setTimeout(this.post.bind(this), delay, text, img).unref();
    }

    postTime (time, text, img) {
        this.postDelayed(time.getTime() - Date.now(), text, img);
    }
}