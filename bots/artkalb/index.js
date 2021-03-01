'use strict';

const Bot = require('../bot');

// the regular expression used to test for puns in messages.
const punRegExpEn = /\S{4,}[eo]r\b/gi;
const punRegExpEs = /\S{2,}ella\b/gi;
const punRegExpFr = /\S{4,}sa\b/gi;

// "____er? I hardly know her!" functionality
const hardlyKnowHer = {
    setup: function (self) {
        // keep track of the last time we sent a message (for rate limiting)
        self.lastMsgTime = 0;
    },
    consult: function (self, msg) {
        function post (word, lang) {
            self.lastMsgTime = Date.now();

            switch (lang) {
                case 'es':
                    self.post('¿' + word + '? ¡Apenas la conozco!');
                    break;
                case 'fr':
                    self.post(word + '? Je la connais à peine!')
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

                self.post(response);
                return;
            }
        }

        // rate limiting. If we sent a message less than self.msgDelay ms ago,
        // don't send another message (don't even look for puns)
        if (Date.now() - self.lastMsgTime < self.options.msgDelay) return;

        // get matches
        var matches = [].concat(
            (msg.text.match(punRegExpEn) || []).map(m => ({text: m, lang: 'en'})),
            (msg.text.match(punRegExpEs) || []).map(m => ({text: m, lang: 'es'})),
            (msg.text.match(punRegExpFr) || []).map(m => ({text: m, lang: 'fr'}))
        )

        if (matches && matches.length) {

            // find the longest matching word
            var longestMatch = matches[0];
            for (var i = 1; i < matches.length; i++) {
                if (matches[i].text.length > longestMatch.text.length) {
                    longestMatch = matches[i];
                }
            }

            post(longestMatch.text, longestMatch.lang);
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
        super('artkalb', id, options, {
            specialCases: [],
            msgDelay: 1000 * 60 * 10,
            databaseUrl: ''
        });

        if (this.options.specialCasesStr) {
            this.options.specialCases =
                parseSpecialCases(this.options.specialCasesStr)
        }

        hardlyKnowHer.setup(this);
    }

    consult (msg) {
        hardlyKnowHer.consult(this, msg);
    }
};
