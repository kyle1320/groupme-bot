'use strict';

const Bot = require('../bot');
const verbs = require('./verbs');

// the regular expression used to test for "real puns" in messages.
// these will be filtered according to the verb dictionary.
const realPunRegExp = /[a-z]+[eo]r\b/gi;

// the regular expression used to test for "fake puns" in messages.
// these might not be real words, but they're long enough to be funny.
const fakePunRegExp = /[a-z]{6,}[eo]r\b/gi;

module.exports = class ArtKalb extends Bot {
    constructor (id, delay, specialCases) {
        super('artkalb', id);

        // 10 minute default delay between messages
        this.msgDelay = +delay || 1000 * 60 * 10;

        // keep track of the last time we sent a message (for rate limiting)
        this.lastMsgTime = 0;

        // array of special cases
        this.specialCases = specialCases || [];
    }

    consult (msg) {
        // special cases also override the time delay (you're welcome, Art)
        for (var i = 0; i < this.specialCases.length - 1; i += 2) {
            var re = this.specialCases[i];
            var response = this.specialCases[i + 1];

            if (re instanceof RegExp && re.test(msg.text)) {
                return this.makePun(response);
            }
        }

        // rate limiting. If we sent a message less than this.msgDelay ms ago,
        // don't send another message (don't even look for puns)
        if (Date.now() - this.lastMsgTime < this.msgDelay) return;

        // get matches from the real and fake expressions
        var matches = [];

        // find real puns, filter them, and add them
        var realMatches = msg.text.match(realPunRegExp);
        if (realMatches) {
            realMatches = realMatches.filter(function(word) {
                return word.toLowerCase() in verbs;
            });

            matches = matches.concat(realMatches);
        }

        // find fake puns and add them
        var fakeMatches = msg.text.match(fakePunRegExp);
        if (fakeMatches) {
            matches = matches.concat(fakeMatches);
        }

        if (matches && matches.length) {

            // find the longest matching word
            var longestMatch = matches[0];
            for (var i = 1; i < matches.length; i++) {
                if (matches[i].length > longestMatch.length) {
                    longestMatch = matches[i];
                }
            }

            return this.makePun(longestMatch);
        }
    }

    // should only be called when sending a message.
    makePun (word) {
        this.lastMsgTime = Date.now();

        return this.makeMessage(word + '? I hardly know her!');
    }
};