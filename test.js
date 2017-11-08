'use strict';

const util = require('./util');
const assert = require('assert');
const botRunner = require('./botrunner');
const http = require('http');
const express = require('express');

process.env.ARTKALB_MSG_DELAY = 150;
process.env.ARTKALB_SPECIAL_CASES = '["blahblah\\\\b", "BlahBlahBlah"]';

const pushMessage = msg => messages.push(msg);

const harambe = new (require('./bots/harambe'))('harambeid', pushMessage);
const artkalb = new (require('./bots/artkalb'))('artkalbid', pushMessage);
const hogs    = new (require('./bots/hogs'))   ('hogsid',    pushMessage);
const debug   = new (require('./bots/debug'))  ('debugid',   pushMessage);

const messages = [];

function checkMessages(...contents) {
    assert.equal(messages.length, contents.length, "incorrect number of messages");

    contents.forEach(function (content) {
        var index = messages.findIndex(function (msg) {
            for (var key in content) {
                if (content[key] instanceof RegExp) {
                    if (!content[key].test(msg[key])) {
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

testBot(debug,
    {text: 'harambe'},
    {text: 'harambe: Dicks out for Harambe!'}
);

testBot(debug,
    {text: '/help harambe'},
    {text: 'harambe: Dicks out for Harambe!'},
    {text: /^hogs\: /}
);

console.log('======================\nRunning http tests...\n======================');

// test Bot Runner

const testBotRunner = botRunner(artkalb, harambe, hogs, debug);
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
            {bot_id: 'harambeid', text: 'Dicks out for Harambe!'}
        );

        await testRequest('/debug',
            {text: '/help harambe translator'},
            {bot_id: 'debugid', text: 'harambe: Dicks out for Harambe!'},
            {bot_id: 'debugid', text: 'artkalb: translator? I hardly know her!'},
            {bot_id: 'debugid', text: /^hogs\: /}
        );

        await testRequest('/artkalb',
            {text: 'blahblah vibrator'},
            {bot_id: 'artkalbid', text: 'BlahBlahBlah? I hardly know her!'}
        );

        await testRequest('/artkalb',
            {text: 'estrella'},
            {bot_id: 'artkalbid', text: 'estrella? ¡Apenas la conozco!'}
        );

        await testRequest('/artkalb',
            {text: 'i know a girl'},
            {bot_id: 'artkalbid', text: 'Girl!? Where??', picture_url:/./}
        );

        await testRequest('/hogs',
            {text: '/calc 5+5'},
            {bot_id: 'hogsid', text: '>>>> 5+5\n10'}
        );

        await testRequest('/artkalb',
            {text: '🅱️aller'},
            {bot_id: 'artkalbid', text: '🅱️aller? I hardly know her!'}
        );

        console.log('passed all tests');
    } catch (e) {
        console.log(e);
        return;
    } finally {
        server.close();
    }
}());