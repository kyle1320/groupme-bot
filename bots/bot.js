'use strict';

const EventEmitter = require('events');
const message = require('./message');
const BotGroup = require('./botgroup');

// Bots should extend this class and override consult().
class Bot extends EventEmitter {

    // name is the path this bot will be acessible by
    // id is the bot ID to send to GroupMe
    constructor (name, id, options, defaultOptions = {}) {
        super();

        if (typeof name !== 'string') throw new TypeError('name must be a string!');
        if (typeof id !== 'string') throw new TypeError('id must be a string!');

        this.name = name;
        this.id = id;

        this.options = options || {};

        for (var key in defaultOptions) {
            if (typeof this.options[key] === 'undefined') {
                this.options[key] = defaultOptions[key];
            }
        }
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

    clone () {
        return new (this.constructor)(this.id, cloneObject(this.options));
    }
}

function cloneObject(obj) {
    var clone = {}

    for (var key in obj) {
        var value = obj[key];

        // TODO: possible infinite recursion
        if (value instanceof Bot) {
            value = value.clone();
        } else if (value instanceof BotGroup) {
            value = value.clone();
        }

        clone[key] = value;
    }

    return clone;
}

module.exports = Bot;