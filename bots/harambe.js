exports.name = 'harambe';

exports.consult = function(msg) {
    if (msg.text.match(/harambe/i)) {
        return {
            'bot_id': process.env.HARAMBE_BOT_ID,
            'text': 'Dicks out for Harambe!'
        };
    }
};
