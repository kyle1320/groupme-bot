var assert = require('assert');

process.env.HARAMBE_BOT_ID = 'harambeid';
process.env.ARTKALB_BOT_ID = 'artkalbid';
process.env.ARTKALB_DELAY = 1500;

var BotRunner = require('./botrunner');
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

// test Bot Runner in verbose mode

var testBotRunner = new BotRunner(function(){}, {
    verbose: true,
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
        assert.equal(msgs[1].text, 'haramberger? I hardly know her!');
    } else {
        assert.equal(msgs[0].text, 'haramberger? I hardly know her!');
        assert.equal(msgs[1].text, 'Dicks out for Harambe!');
    }
}).then(function() {
    testBotRunner.close();

    // test Bot Runner in non-verbose mode

    testBotRunner = new BotRunner(function(){}, {
        verbose: false,
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
        '/all?debug',
        {'text': 'haramberger'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 2);

    if (msgs[0].text === 'harambe: Dicks out for Harambe!') {
        assert.equal(msgs[0].bot_id, 'debugid');
        assert.equal(msgs[1].text, 'artkalb: haramberger? I hardly know her!');
        assert.equal(msgs[1].bot_id, 'debugid');
    } else {
        assert.equal(msgs[0].text, 'artkalb: haramberger? I hardly know her!');
        assert.equal(msgs[0].bot_id, 'debugid');
        assert.equal(msgs[1].text, 'harambe: Dicks out for Harambe!');
        assert.equal(msgs[1].bot_id, 'debugid');
    }
}).then(function() {
    return testRequest(
        '/artkalb?debug',
        {'text': 'pumpernickel overachiever'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'artkalb: Pump \'er Nickel? I hardly know her!');
    assert.equal(msgs[0].bot_id, 'debugid');
}).then(function() {
    return testRequest(
        '/harambe?debug',
        {'text': 'harambe'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'harambe: Dicks out for Harambe!');
    assert.equal(msgs[0].bot_id, 'debugid');
}).then(function() {
    testBotRunner.close();

    console.log('passed all tests');
});
