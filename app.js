'use strict';

const https = require('https');
const BotRunner = require('./botrunner');

const HogsBot = require('./bots/hogs');
const HarambeBot = require('./bots/harambe');
const ArtKalbBot = require('./bots/artkalb');

const postOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

function submit(body) {
    var req = https.request(postOptions);
    req.end(JSON.stringify(body));
}

// runner? I hardly know her!
const runner = new BotRunner(submit, {
    verbose: process.env.BOT_VERBOSE,
    debugBotId: process.env.DEBUG_BOT_ID
});

// parse the special cases for artkalb bot
var specialCases = undefined;
try {
    specialCases = JSON.parse(process.env.ARTKALB_SPECIAL_CASES);
    if (!(specialCases instanceof Array)) specialCases = undefined;
    else {
        for (var i = 0; i < specialCases.length; i += 2) {
            specialCases[i] = new RegExp(specialCases[i], 'ig');
        }
    }
} catch (e) {
    console.log(e);
}

const hogs = new HogsBot(process.env.HOGS_BOT_ID || 'hogsid');
const harambe = new HarambeBot(process.env.HARAMBE_BOT_ID);
const artkalb = new ArtKalbBot(
    process.env.ARTKALB_BOT_ID,
    process.env.ARTKALB_MSG_DELAY,
    specialCases
);

runner.addBot(hogs);
runner.addBot(harambe);
runner.addBot(artkalb);

runner.listen(process.env.PORT);
