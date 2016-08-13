exports.consult = function consult(msg, say) {
    if (msg.text.match(/harambe/i)) {
        say('Dicks out for Harambe!', process.env.HARAMBE_BOT_ID);
    }
};