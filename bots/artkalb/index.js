'use strict';

const Bot = require('../bot');
const getMeme = require('./memegen');

// the regular expression used to test for puns in messages.
const punRegExpEn = /\S{4,}[eo]r\b/gi;
const punRegExpEs = /\S{2,}ella\b/gi;

// "____er? I hardly know her!" functionality
const hardlyKnowHer = {
    setup: function (self) {
        var specialCases;
        try {
            specialCases = JSON.parse(process.env.ARTKALB_SPECIAL_CASES);
            if (!(specialCases instanceof Array)) specialCases = [];
            else {
                for (var i = 0; i < specialCases.length; i += 2) {
                    specialCases[i] = new RegExp(specialCases[i], 'i');
                }
            }
        } catch (e) {
            console.log(e);
            specialCases = [];
        }

        // 10 minute default delay between messages
        self.msgDelay = +process.env.ARTKALB_MSG_DELAY || 1000 * 60 * 10;

        // keep track of the last time we sent a message (for rate limiting)
        self.lastMsgTime = 0;

        // list of special cases
        self.specialCases = specialCases;
    },
    consult: function (self, msg) {
        function post (word, ignoreTimeDelay, lang) {
            if (!ignoreTimeDelay) {
                self.lastMsgTime = Date.now();
            }

            switch (lang) {
                case 'es':
                    self.post('¿' + word + '? ¡Apenas la conozco!');
                    break;
                default:
                    self.post(word + '? I hardly know her!');
                    break;
            }
        }

        // special cases also override the time delay (you're welcome, Art)
        for (var i = 0; i < self.specialCases.length - 1; i += 2) {
            var re = self.specialCases[i];
            var response = self.specialCases[i + 1];

            if (re instanceof RegExp && re.test(msg.text)) {

                post(response, true);
                return;
            }
        }

        // rate limiting. If we sent a message less than self.msgDelay ms ago,
        // don't send another message (don't even look for puns)
        if (Date.now() - self.lastMsgTime < self.msgDelay) return;

        // get matches
        var matches = [].concat(
            (msg.text.match(punRegExpEn) || []).map(m => ({text: m, lang: 'en'})),
            (msg.text.match(punRegExpEs) || []).map(m => ({text: m, lang: 'es'}))
        )

        if (matches && matches.length) {

            // find the longest matching word
            var longestMatch = matches[0];
            for (var i = 1; i < matches.length; i++) {
                if (matches[i].text.length > longestMatch.text.length) {
                    longestMatch = matches[i];
                }
            }

            post(longestMatch.text, false, longestMatch.lang);
        }
    }
};

// pickup line memes
const pickupLines = {
    setup: function (self) {

    },
    consult: async function (self, msg) {
        var match = msg.text.match(/girls?\b/i)

        if (match && match.length) {
            var usage = match[0][0].toUpperCase() + match[0].substring(1).toLowerCase();
            var img = await getMeme();

            self.post(usage + "!? Where??", img)
        }
    }
};

module.exports = class ArtKalb extends Bot {
    constructor (id) {
        super('artkalb', id);

        hardlyKnowHer.setup(this);
        pickupLines.setup(this);
    }

    consult (msg) {
        hardlyKnowHer.consult(this, msg);
        pickupLines.consult(this, msg);
    }
};