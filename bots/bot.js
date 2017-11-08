'use strict';

// Bots should extend this class and override consult().
module.exports = class Bot {

    // name is the path this bot will be acessible by
    // id is the bot ID to send to GroupMe
    constructor (name, id, submit) {
        if (typeof name !== 'string') throw new TypeError('name must be a string!');
        if (typeof id !== 'string') throw new TypeError('id must be a string!');
        if (typeof submit !== 'function') throw new TypeError('submit must be a function!');

        this.name = name;
        this.id = id;
        this.submit = submit;
    }

    consult (msg) {
        throw new Error('Subclass must implement consult()');
    }

    post (text, img) {
        this.submit.call(this,
            img ? { bot_id: this.id, text: text, picture_url: img }
                : { bot_id: this.id, text: text });
    }

    postDelayed (text, delay) {
        setTimeout(this.post.bind(this), delay, text).unref();
    }

    postTime (text, time) {
        this.postDelayed(text, time.getTime() - Date.now());
    }
}