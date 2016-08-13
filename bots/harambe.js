exports.name = 'harambe';

exports.consult = function consult(msg, say) {
    if (process.env.BOT_DEBUG) {
        console.log('harambe got message');
    }

    if (msg.text.match(/harambe/i)) {
        say('Dicks out for Harambe!', module.exports);
    }
};

exports.getId = function() {
    return process.env.HARAMBE_BOT_ID;
};