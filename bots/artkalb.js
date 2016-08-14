
// the regular expression used to test for "puns" in messages.
const punRegExp = /([a-z]{3,}[eo]r)\b/gi;

// 10 minute default delay between messages
const MSG_DELAY = +process.env.ARTKALB_DELAY || 1000 * 60 * 10;

var lastMsgTime = 0;

exports.name = 'artkalb';
exports.id = process.env.ARTKALB_BOT_ID;

exports.consult = function(msg) {

    // this special case also overrides the time delay (you're welcome, Art)
    if (/pumpernickel\b/i.test(msg.text)) {
        return makePun('Pump \'er Nickel');
    }

    if (Date.now() - lastMsgTime < MSG_DELAY) return; // too soon

    var matches = msg.text.match(punRegExp);

    if (matches && matches.length) {

        // find the longest matching word
        var longestMatch = matches[0];
        for (var i = 1; i < matches.length; i++) {
            if (matches[i].length > longestMatch.length) {
                longestMatch = matches[i];
            }
        }

        return makePun(longestMatch);
    }
};

// should only be called when sending a message.
function makePun(word) {

    // note the current time (for rate limiting)
    lastMsgTime = Date.now();

    return {
        'text': word + '? I hardly know her!'
    };
}