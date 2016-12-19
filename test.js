'use strict';

const assert = require('assert');
const botRunner = require('./botrunner');
const http = require('http');
const express = require('express');

process.env.ARTKALB_MESSAGE_DELAY = 150;
process.env.ARTKALB_SPECIAL_CASES = '["blahblah\\\\b", "BlahBlahBlah"]';

var messages = [];
var harambe = new (require('./bots/harambe'))('harambeid', pushMessage);
var artkalb = new (require('./bots/artkalb'))('artkalbid', pushMessage);
var hogs = new (require('./bots/hogs'))('hogsid', pushMessage);
var debug = new (require ('./bots/debug'))('debugid', pushMessage);

var testBotRunner = botRunner(artkalb, harambe, hogs, debug);

function pushMessage(msg) {
    messages.push(msg);
}

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
    checkMessages.apply(null, responses);
}

function testRequest(path, body, delay, ...responses) {
    console.log("POST", path, body);
    return new Promise(function(resolve, reject) {
        var arr = [];
        testBotRunner.submit = function(msg) {
            arr.push(msg);
        };
        http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).end(JSON.stringify(body));
        setTimeout(function() {resolve(arr)}, delay);
    }).then(function () {
        checkMessages.apply(null, responses);
    });
}

// test Harambe bot

console.log('====================\nRunning local tests...\n====================');

testBot(
    harambe,
    {text: 'harambe'},
    {text: 'Dicks out for Harambe!'}
);

testBot(
    harambe,
    {text: 'cHaraMber alwhna'},
    {text: 'Dicks out for Harambe!'}
);

testBot(
    harambe,
    {text: 'nothing :('}
);

testBot(
    harambe,
    {text: 'nothing', name: 'I am harambe!'},
    {text: 'Harambe lives!'}
);

testBot(
    harambe,
    {text: 'aaaharambea', name: 'I am harambe!'},
    {text: 'Harambe lives!'},
    {text: 'Dicks out for Harambe!'}
);

// test Art Kalb bot

testBot(
    artkalb,
    {text: 'nothing :('}
);

testBot(
    artkalb,
    {text: 'abcer'}
);

testBot(
    artkalb,
    {text: 'NaIler wiper'},
    {text: 'NaIler? I hardly know her!'}
);

testBot(
    artkalb,
    {text: 'creater'}
);

// test hogs bot

testBot(
    hogs,
    {text: '/help'},
    {text: /.+/}
);

testBot(
    hogs,
    {text: '/test'},
    {text: '>This is a test\nThis is a test'}
);

testBot(
    hogs,
    {text: '/eval 1<<10'},
    {text: '>>>> 1<<10\n1024'}
);

// test debug bot

testBot(
    debug,
    {text: 'harambe'},
    {text: 'harambe: Dicks out for Harambe!'}
);

testBot(
    debug,
    {text: '/help harambe'},
    {text: 'harambe: Dicks out for Harambe!'},
    {text: /^hogs\: /}
);

// test Bot Runner

console.log('====================\nRunning http tests...\n====================');

var app = new express();
app.use(testBotRunner);
var server = app.listen(3000);

testRequest(
    '/artkalb',
    {text: 'hello'},
    100
).then(function() {
    return testRequest(
        '/harambe',
        {text: 'harambe'},
        100,
        {bot_id: 'harambeid', text: 'Dicks out for Harambe!'}
    );
}).then(function() {
    return testRequest(
        '/debug',
        {text: '/help harambe translator'},
        100,
        {bot_id: 'debugid', text: 'harambe: Dicks out for Harambe!'},
        {bot_id: 'debugid', text: 'artkalb: translator? I hardly know her!'},
        {bot_id: 'debugid', text: /^hogs\: /}
    );
}).then(function() {
    return testRequest(
        '/artkalb',
        {text: 'blahblah vibrator'},
        200,
        {bot_id: 'artkalbid', text: 'BlahBlahBlah? I hardly know her!'}
    );
}).then(function() {
    return testRequest(
        '/artkalb',
        {text: 'blahblah vibrator'},
        100,
        {bot_id: 'artkalbid', text: 'BlahBlahBlah? I hardly know her!'}
    );
}).then(function() {
    return testRequest(
        '/hogs',
        {text: '/eval 5+5'},
        100,
        {bot_id: 'hogsid', text: '>>>> 5+5\n10'}
    );
}).then(function() {
    server.close();

    console.log('passed all tests');
}).catch(function (err) {
    console.error(err);
});