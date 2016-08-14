var assert = require('assert');

process.env.HARAMBE_BOT_ID = 'harambeid';
process.env.ARTKALB_BOT_ID = 'artkalbid';
process.env.ARTKALB_DELAY = 1500;

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

var artkalbTest1 = artkalb.consult({text: 'nothing :('});
assert(!artkalbTest1);

var artkalbTest2 = artkalb.consult({text: 'longer longererer'});
assert(artkalbTest2);
assert.equal(artkalbTest2.text, 'longererer? I hardly know her!');

var artkalbTest3 = artkalb.consult({text: 'chamber'});
assert(!artkalbTest3);

// test Bot Runner in debug mode

var testBotRunner = new BotRunner(function(){}, {
    debug: true,
    debugBotId: 'debugid'
});
testBotRunner.addBot(artkalb);
testBotRunner.addBot(harambe);
testBotRunner.listen(3000);

const http = require('http');

function testRequest(path, body) {
    console.log("TEST", path, body);
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
        setTimeout(function() {resolve(arr)}, 1000);
    });
}

testRequest(
    '/artkalb',
    {'text': 'hello'}
).then(function(msgs) {
    assert.equal(msgs.length, 0);
}).then(function() {
    return testRequest(
        '/harambe',
        {'text': 'harambe'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'harambe: Dicks out for Harambe!');
    assert.equal(msgs[0].bot_id, 'debugid');
}).then(function() {
    return testRequest(
        '/all',
        {'text': 'haramberger'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 2);

    if (msgs[0].text === 'harambe: Dicks out for Harambe!') {
        assert.equal(msgs[1].text, 'artkalb: haramberger? I hardly know her!');
    } else {
        assert.equal(msgs[0].text, 'artkalb: haramberger? I hardly know her!');
        assert.equal(msgs[1].text, 'harambe: Dicks out for Harambe!');
    }
}).then(function() {
    testBotRunner.close();

    // test Bot Runner in non-debug mode

    testBotRunner = new BotRunner(function(){}, {
        debug: false,
        debugBotId: 'debugid'
    });
    testBotRunner.addBot(artkalb);
    testBotRunner.addBot(harambe);
    testBotRunner.listen(3000);

    return testRequest(
        '/artkalb',
        {'text': 'hello'}
    )
}).then(function(msgs) {
    assert.equal(msgs.length, 0);
}).then(function() {
    return testRequest(
        '/harambe',
        {'text': 'harambe'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'Dicks out for Harambe!');
    assert.equal(msgs[0].bot_id, 'harambeid');
}).then(function() {
    return testRequest(
        '/all',
        {'text': 'haramberger'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 2);

    if (msgs[0].text === 'Dicks out for Harambe!') {
        assert.equal(msgs[0].bot_id, 'harambeid');
        assert.equal(msgs[1].text, 'haramberger? I hardly know her!');
        assert.equal(msgs[1].bot_id, 'artkalbid');
    } else {
        assert.equal(msgs[0].text, 'haramberger? I hardly know her!');
        assert.equal(msgs[0].bot_id, 'artkalbid');
        assert.equal(msgs[1].text, 'Dicks out for Harambe!');
        assert.equal(msgs[1].bot_id, 'harambeid');
    }
}).then(function() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(testRequest(
                '/artkalb',
                {'text': 'pumpernickel overachiever'}
            ));
        }, 1000);
    });
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'Pump \'er Nickel? I hardly know her!');
    assert.equal(msgs[0].bot_id, 'artkalbid');
}).then(function() {
    testBotRunner.close();

    console.log('passed all tests');
});