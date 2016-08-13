exports.consult = function consult(msg, say) {
    if (process.env.BOT_DEBUG) {
        console.log('harambe got message');
    }

    if (msg.text.match(/harambe/i)) {
        say('Dicks out for Harambe!', process.env.HARAMBE_BOT_ID);
    }
};