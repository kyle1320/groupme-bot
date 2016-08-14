var assert = require('assert');

process.env.BOT_DEBUG = 'true';
process.env.HARAMBE_BOT_ID = 'harambeid';
process.env.ARTKALB_BOT_ID = 'artkalbid';
process.env.DEBUG_BOT_ID = 'debugid';
process.env.BOT_MODES = 'artkalb;harambe';

var BotRunner = require('./BotRunner');
var harambe = require('./bots/harambe');
var artkalb = require('./bots/artkalb');

// test Harambe bot

var harambeTest1 = harambe.consult({text: 'harambe'});
assert(harambeTest1);
assert.equal(harambeTest1.text, 'Dicks out for Harambe!');

var harambeTest2 = harambe.consult({text: 'cHaraMber alwhna'});
assert(harambeTest2);
assert.equal(harambeTest2.text, 'Dicks out for Harambe!');

var harambeTest3 = harambe.consult({text: 'nothing :('});
assert(!harambeTest3);

// test Art Kalb bot

// var artkalbTest1 = artkalb.consult({text: 'nothing :('});
// assert(!artkalbTest1);

// var artkalbTest2 = artkalb.consult({text: 'longer longererer'});
// assert(artkalbTest2);
// assert.equal(artkalbTest2.text, 'longererer? I hardly know her!');

// var artkalbTest3 = artkalb.consult({text: 'chamber'});
// assert(!artkalbTest3);

// test Bot Runner

var testBotRunner = new BotRunner(function(){}, {
    debug: true,
    debugBotId: 'debugid'
});
testBotRunner.addBot(artkalb);
testBotRunner.addBot(harambe);
testBotRunner.listen(3000);

const http = require('http');

function testRequest(path, body, def) {
    return new Promise(function(resolve, reject) {
        testBotRunner.submit = function(msg) {
            console.log(msg);
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
        setTimeout(function() {resolve(def)}, 1000);
    });
}

// testRequest(
//     '/artkalb',
//     {'text': 'hello'},
//     true
// );
// .then(function(v) {
//     assert.equal(v, true)
// }).then(function() {
    testRequest(
        '/harambe',
        {'text': 'harambe'}
    );
// }).then(function(msg) {
//     assert(msg);
//     assert.equal(msg.text, 'Dicks out for Harambe!');
// }).then(function() {
    testRequest(
        '/harambe',
        {'text': 'harambe'}
    );
// }).then(function(msg) {
//     assert(msg);
//     assert.equal(msg.bot_id, 'debugid');
// }).then(function() {
    return testRequest(
        '/all',
        {'text': 'haramberger'}
    );
// }).then(function() {
//     console.log('passed all tests');
// });