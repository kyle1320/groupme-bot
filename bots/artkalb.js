const re = /([a-z]{3,}[eo]r)\b/gi;

// 10 minute default delay between messages
const MSG_DELAY = +process.env.ARTKALB_DELAY || 1000 * 60 * 10;

var lastMsgTime = 0;

exports.name = 'artkalb';

exports.consult = function(msg, say) {
    if (process.env.BOT_DEBUG) {
        console.log('artkalb got message');
    }

    if (typeof msg !== 'object') return;
    msg.text = msg.text || '';

    if (Date.now() - lastMsgTime >= MSG_DELAY) {
        var matches = msg.text.match(re);

        if (matches && matches.length) {

            // use the longest match
            matches.sort(function(a,b) { return b.length - a.length });

            say(format(matches[0]), module.exports);

            lastMsgTime = Date.now();
        }
    }
};

exports.getId = function() {
    return process.env.ARTKALB_BOT_ID;
};

function format(word) {
    return word + '? I hardly know her!';
}

// tests. Should print out 'appreciator? I hardly know her!'
if (require.main === module) {
    exports.consult({text: ''}, console.log);
    exports.consult({text: 'garbage text'}, console.log);
    exports.consult({text: 'radiators'}, console.log);
    exports.consult({text: 'carrier appreciator'}, console.log);
    exports.consult({text: 'radiater'}, console.log);
}