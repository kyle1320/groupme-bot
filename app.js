'use strict';

const express = require('express');
const botRunner = require('./botrunner');
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
const runner = botRunner(
    new DebugBot  (process.env.DEBUG_BOT_ID,   postMessage),
    new HogsBot   (process.env.HOGS_BOT_ID,    postMessage),
    new HarambeBot(process.env.HARAMBE_BOT_ID, postMessage),
    new ArtKalbBot(process.env.ARTKALB_BOT_ID, postMessage)
);

var app = new express();
app.use(runner);
app.listen(process.env.PORT || 3000);