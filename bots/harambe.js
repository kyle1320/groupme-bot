var Bot = require('./bot');

module.exports = class Harambe extends Bot {
    constructor (id) {
        super('harambe', id);
    }

    consult (msg) {
        if (msg.text.match(/harambe/i)) {
            return this.makeMessage('Dicks out for Harambe!');
        }
    }
};