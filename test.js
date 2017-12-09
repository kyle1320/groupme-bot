'use strict';

const util = require('./util');
const assert = require('assert');
const botRouter = require('./botrouter');
const BotGroup = require('./bots/botgroup');
const http = require('http');
const express = require('express');

// import to test for obvious errors in index.js
//const router = require('.');

const harambe = new (require('./bots/harambe'))('harambeid', {

});
const artkalb = new (require('./bots/artkalb'))('artkalbid', {
    specialCases:    [/blahblah\b/i, "BlahBlahBlah"],
    msgDelay:        150,
    databaseUrl:     process.env.DATABASE_URL,
    groupmeApiToken: process.env.GROUPME_TOKEN
});
const hogs    = new (require('./bots/hogs'))   ('hogsid', {
    hogsCalendarId:   process.env.HOGS_CALENDAR_ID,
    googleApiKey:     process.env.GOOGLE_API_KEY,
    feedbackBotId:    process.env.FEEDBACK_BOT_ID,
    twitterApiKey:    process.env.TWITTER_API_KEY,
    twitterApiSecret: process.env.TWITTER_API_SECRET,
    twitterApiToken:  process.env.TWITTER_API_TOKEN,
});
// const debug   = new (require('./bots/debug'))  ('debugid', {

// });

const bots = new BotGroup(artkalb, harambe, hogs);
bots.on('message', msg => messages.push(msg));

const messages = [];

function checkMessages(...contents) {
    assert.equal(messages.length, contents.length, "incorrect number of messages");

    contents.forEach(function (content) {
        var index = messages.findIndex(function (msg) {
            for (var key in content) {
                if (content[key] instanceof RegExp) {
                    if (msg[key] == null || !content[key].test(msg[key])) {
                        return false;
                    }
                } else if (msg[key] !== content[key]) {
                    return false;
                }
            }
            return true;
        });

        assert(index >= 0, "message not found: " + JSON.stringify(content));

        messages.splice(index, 1);
    });
}

function testBot(bot, body, ...responses) {
    console.log("TEST", bot.name, body);
    bot.consult(body);
    messages.forEach(x=>console.log(JSON.stringify(x)));
    checkMessages.apply(null, responses);
}

async function testRequest(path, body, ...responses) {
    console.log("POST", path, body);

    http.request({
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).end(JSON.stringify(body));

    await util.sleep(100);

    checkMessages.apply(null, responses);
}

console.log('======================\nRunning local tests...\n======================');

// test Harambe bot

testBot(harambe,
    {text: 'harambe'},
    {text: 'Dicks out for Harambe!'}
);

testBot(harambe,
    {text: 'cHaraMber alwhna'},
    {text: 'Dicks out for Harambe!'}
);

testBot(harambe,
    {text: 'nothing :('}
);

testBot(harambe,
    {text: 'nothing', name: 'I am harambe!'},
    {text: 'Harambe lives!'}
);

testBot(harambe,
    {text: 'aaaharambea', name: 'I am harambe!'},
    {text: 'Harambe lives!'},
    {text: 'Dicks out for Harambe!'}
);

// test Art Kalb bot

testBot(artkalb,
    {text: 'nothing :('}
);

testBot(artkalb,
    {text: 'abcer'}
);

testBot(artkalb,
    {text: 'NaIler wiper'},
    {text: 'NaIler? I hardly know her!'}
);

testBot(artkalb,
    {text: 'creater'}
);

// test hogs bot

testBot(hogs,
    {text: '/help'},
    {text: /.+/}
);

testBot(hogs,
    {text: '/calc 1<<10'},
    {text: '>>>> 1<<10\n1024'}
);

testBot(hogs,
    {text: '/calc sum(max(3, 5), range(10))'},
    {text: '>>>> sum(max(3, 5), range(10))\n50'}
);

testBot(hogs,
    {text: '/calc var a = 2'},
    {text: '>>>> var a = 2\nundefined'}
);

testBot(hogs,
    {text: '/calc a'},
    {text: '>>>> a\nReferenceError: a is not defined'}
);

testBot(hogs,
    {text: '13:35 /help'},
    {text: /.+/}
);

testBot(hogs,
    {text: '/feedback testing'},
    {text: '>Feedback sent. Thanks!'}
);

// test debug bot

// testBot(debug,
//     {text: 'harambe'},
//     {text: 'harambe: Dicks out for Harambe!'}
// );

// testBot(debug,
//     {text: '/help harambe'},
//     {text: 'harambe: Dicks out for Harambe!'},
//     {text: /^hogs\: /}
// );

console.log('======================\nRunning http tests...\n======================');

// test Bot Runner

const testBotRunner = botRouter(bots);
const app = new express();
app.use(testBotRunner);
const server = app.listen(3000);

(async function() {
    try {
        await testRequest('/artkalb',
            {text: 'hello'}
        );

        await testRequest('/harambe',
            {text: 'harambe'},
            {botId: 'harambeid', text: 'Dicks out for Harambe!'}
        );

        // await testRequest('/debug',
        //     {text: '/help harambe translator'},
        //     {botId: 'debugid', text: 'harambe: Dicks out for Harambe!'},
        //     {botId: 'debugid', text: 'artkalb: translator? I hardly know her!'},
        //     {botId: 'debugid', text: /^hogs\: /}
        // );

        await testRequest('/artkalb',
            {text: 'blahblah vibrator'},
            {botId: 'artkalbid', text: 'BlahBlahBlah? I hardly know her!'}
        );

        await testRequest('/artkalb',
            {text: 'estrella'},
            {botId: 'artkalbid', text: '¿estrella? ¡Apenas la conozco!'}
        );

        await testRequest('/artkalb',
            {text: 'i know a girl'},
            {botId: 'artkalbid', text: 'Girl!? Where??', imageUrl:/./}
        );

        await testRequest('/hogs',
            {text: '/calc 5+5'},
            {botId: 'hogsid', text: '>>>> 5+5\n10'}
        );

        await testRequest('/artkalb',
            {text: '🅱️aller'},
            {botId: 'artkalbid', text: '🅱️aller? I hardly know her!'}
        );

        console.log('passed all tests');
    } catch (e) {
        console.log(e);
        return;
    } finally {
        server.close();
    }
}());