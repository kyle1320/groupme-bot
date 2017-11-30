'use strict';

const groupmeServices = require('./groupme-services');
const BotGroup = require('./bots/botgroup');
const botRouter = require('./botrouter');

const DebugBot   = require('./bots/debug');
const HogsBot    = require('./bots/hogs');
const HarambeBot = require('./bots/harambe');
const ArtKalbBot = require('./bots/artkalb');

const bots = new BotGroup(
    new DebugBot  (process.env.DEBUG_BOT_ID),
    new HogsBot   (process.env.HOGS_BOT_ID),
    new HarambeBot(process.env.HARAMBE_BOT_ID),
    new ArtKalbBot(process.env.ARTKALB_BOT_ID)
);

// handle bot messages
bots.on('message', function(msg) {
    if (process.env.BOT_VERBOSE) {
        console.log(msg);
    }

    // production. Send messages to GroupMe.
    if (process.env.NODE_ENV === 'production') {
        groupmeServices.postBotMessage(msg);

    // development mode. Messages are printed to console.
    } else {
        console.log(msg);
    }
});

module.exports = botRouter(bots);