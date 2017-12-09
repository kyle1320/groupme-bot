'use strict';

const Bot = require('../bot');
const MemeFactory = require('./memegen');

// the regular expression used to test for puns in messages.
const punRegExpEn = /\S{4,}[eo]r\b/gi;
const punRegExpEs = /\S{2,}ella\b/gi;

// "____er? I hardly know her!" functionality
const hardlyKnowHer = {
    setup: function (self) {
        // keep track of the last time we sent a message (for rate limiting)
        self.lastMsgTime = 0;
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
        for (var i = 0; i < self.options.specialCases.length - 1; i += 2) {
            var re = self.options.specialCases[i];
            var response = self.options.specialCases[i + 1];

            if (re instanceof RegExp && re.test(msg.text)) {

                post(response, true);
                return;
            }
        }

        // rate limiting. If we sent a message less than self.msgDelay ms ago,
        // don't send another message (don't even look for puns)
        if (Date.now() - self.lastMsgTime < self.options.msgDelay) return;

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
        self.memeFactory = new MemeFactory(self.options);
    },
    consult: async function (self, msg) {
        var match = msg.text.match(/girls?\b/i)

        if (match && match.length) {
            var usage = match[0][0].toUpperCase() + match[0].substring(1).toLowerCase();
            var img = await self.memeFactory.getMeme();

            self.post(usage + "!? Where??", img)
        }
    }
};

function parseSpecialCases(specialCasesStr) {
    try {
        var specialCases = JSON.parse(specialCasesStr);

        if (!(specialCases instanceof Array)) return [];
        else {
            for (var i = 0; i < specialCases.length; i += 2) {
                specialCases[i] = new RegExp(specialCases[i], 'i');
            }
            return specialCases
        }
    } catch (e) {
        console.log(e);
        return [];
    }

    return specialCases;
}

module.exports = class ArtKalb extends Bot {
    constructor (id, options) {
        console.log(options);
        super('artkalb', id, options, {
            specialCases: [],
            msgDelay: 1000 * 60 * 10,
            databaseUrl: 'postgres://fake:fake@fake.com/fakedb'
        });

        if (this.options.specialCasesStr) {
            this.options.specialCases =
                parseSpecialCases(this.options.specialCasesStr)
        }

        hardlyKnowHer.setup(this);
        pickupLines.setup(this);
    }

    consult (msg) {
        hardlyKnowHer.consult(this, msg);
        pickupLines.consult(this, msg);
    }
};