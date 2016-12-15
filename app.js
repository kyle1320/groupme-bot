'use strict';

const BotRunner = require('./botrunner');
const groupmeServices = require('./groupme-services');

const DebugBot   = require('./bots/debug');
const HogsBot    = require('./bots/hogs');
const HarambeBot = require('./bots/harambe');
const ArtKalbBot = require('./bots/artkalb');

function postMessage(msg) {
    if (process.env.BOT_VERBOSE) {
        console.log(msg);
    }

    groupmeServices.postBotMessage(msg);
}

// runner? I hardly know her!
const runner = new BotRunner();

runner.addBot(new DebugBot  (process.env.DEBUG_BOT_ID,   postMessage));
runner.addBot(new HogsBot   (process.env.HOGS_BOT_ID,    postMessage));
runner.addBot(new HarambeBot(process.env.HARAMBE_BOT_ID, postMessage));
runner.addBot(new ArtKalbBot(process.env.ARTKALB_BOT_ID, postMessage));

runner.listen(process.env.PORT);