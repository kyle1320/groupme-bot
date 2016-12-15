'use strict';

const Bot = require('../bot');

// the regular expression used to test for puns in messages.
const punRegExp = /[a-z]{4,}[eo]r\b/gi;

module.exports = class ArtKalb extends Bot {
    constructor (id, submit) {
        super('artkalb', id, submit);

        // 10 minute default delay between messages
        this.msgDelay = +process.env.ARTKALB_MSG_DELAY || 1000 * 60 * 10;

        // keep track of the last time we sent a message (for rate limiting)
        this.lastMsgTime = 0;

        // parse special cases
        try {
            this.specialCases = JSON.parse(process.env.ARTKALB_SPECIAL_CASES);
            if (!(this.specialCases instanceof Array)) this.specialCases = [];
            else {
                for (var i = 0; i < this.specialCases.length; i += 2) {
                    this.specialCases[i] = new RegExp(this.specialCases[i], 'ig');
                }
            }
        } catch (e) {
            console.log(e);
            this.specialCases = [];
        }
    }

    consult (msg) {
        // special cases also override the time delay (you're welcome, Art)
        for (var i = 0; i < this.specialCases.length - 1; i += 2) {
            var re = this.specialCases[i];
            var response = this.specialCases[i + 1];

            if (re instanceof RegExp && re.test(msg.text)) {
                this.post(this.makePun(response));
                return;
            }
        }

        // rate limiting. If we sent a message less than this.msgDelay ms ago,
        // don't send another message (don't even look for puns)
        if (Date.now() - this.lastMsgTime < this.msgDelay) return;

        // get matches
        var matches = msg.text.match(punRegExp)

        if (matches && matches.length) {

            // find the longest matching word
            var longestMatch = matches[0];
            for (var i = 1; i < matches.length; i++) {
                if (matches[i].length > longestMatch.length) {
                    longestMatch = matches[i];
                }
            }

            this.post(this.makePun(longestMatch));
        }
    }

    post (text) {
        this.lastMsgTime = Date.now();

        super.post(text);
    }

    makePun (word) {
        return word + '? I hardly know her!';
    }
};