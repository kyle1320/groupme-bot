'use strict';

const groupmeServices = require('./groupme-services');
const BotGroup = require('./bots/botgroup');
const botRouter = require('./botrouter');

const DebugBot   = require('./bots/debug');
const HogsBot    = require('./bots/hogs');
const HarambeBot = require('./bots/harambe');
const ArtKalbBot = require('./bots/artkalb');

const bots = new BotGroup(
    new DebugBot  (process.env.DEBUG_BOT_ID, {

    }),
    new HogsBot   (process.env.HOGS_BOT_ID, {
        hogsCalendarId:   process.env.HOGS_CALENDAR_ID,
        googleApiKey:     process.env.GOOGLE_API_KEY,
        feedbackBotId:    process.env.FEEDBACK_BOT_ID,
        twitterApiKey:    process.env.TWITTER_API_KEY,
        twitterApiSecret: process.env.TWITTER_API_SECRET,
        twitterApiToken:  process.env.TWITTER_API_TOKEN,

    }),
    new HarambeBot(process.env.HARAMBE_BOT_ID, {

    }),
    new ArtKalbBot(process.env.ARTKALB_BOT_ID, {
        specialCasesStr: process.env.ARTKALB_SPECIAL_CASES,
        msgDelay:       +process.env.ARTKALB_MSG_DELAY,
        databaseUrl:     process.env.DATABASE_URL,
        groupmeApiToken: process.env.GROUPME_TOKEN
    })
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

module.exports = {
    BotGroup: BotGroup,
    Bot: require('./bots/bot'),
    bots: {
        debug: require('./bots/debug'),
        debug: require('./bots/hogs'),
        debug: require('./bots/harambe'),
        debug: require('./bots/artkalb')
    },
    botRouter: botRouter
};

// export both the botGroup and the Router, so either can be used
module.exports.group = bots;
module.exports.router = botRouter(bots);