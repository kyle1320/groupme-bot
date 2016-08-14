
// the regular expression used to test for "puns" in messages.
const punRegExp = /([a-z]{3,}[eo]r)\b/gi;

// 10 minute default delay between messages
const MSG_DELAY = +process.env.ARTKALB_DELAY || 1000 * 60 * 10;

var lastMsgTime = 0;

exports.name = 'artkalb';
exports.id = process.env.ARTKALB_BOT_ID;

exports.consult = function(msg) {
    if (typeof msg !== 'object') return;
    if (typeof msg.text !== 'string') return;

    // too soon
    if (Date.now() - lastMsgTime < MSG_DELAY) return;

    var matches = msg.text.match(punRegExp);

    if (matches && matches.length) {

        // use the longest match
        matches.sort(function(a,b) { return b.length - a.length });

        // note the current time (for rate limiting)
        lastMsgTime = Date.now();

        return {
            'text': createPun(matches[0])
        };
    }
};

function createPun(word) {
    return word + '? I hardly know her!';
}