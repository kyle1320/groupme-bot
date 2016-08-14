exports.name = 'harambe';
exports.id = process.env.HARAMBE_BOT_ID;

exports.consult = function(msg) {
    if (msg.text.match(/harambe/i)) {
        return {
            'text': 'Dicks out for Harambe!'
        };
    }
};