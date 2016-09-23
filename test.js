var assert = require('assert');

var BotRunner = require('./botrunner');
var harambe = new (require('./bots/harambe'))('harambeid');
var artkalb = new (require('./bots/artkalb'))('artkalbid', 1500, [
    /blahblah\b/gi, "BlahBlahBlah"
]);

function checkMessages(msgs, ...contents) {
    assert.equal(msgs.length, contents.length);

    assert(contents.every(function (content) {
        var index = msgs.findIndex(function (msg) {
            return msg.text === content.text;
        });

        if (index >= 0) {
            var msg = msgs.splice(index, 1)[0];

            for (var key in content) {
                assert.equal(msg[key], content[key]);
            }
        }

        return index >= 0;
    }));
}

// test Harambe bot

var harambeTest1 = harambe.consult({text: 'harambe'});
assert(harambeTest1);
assert.equal(harambeTest1.length, 1);
assert.equal(harambeTest1[0].text, 'Dicks out for Harambe!');

var harambeTest2 = harambe.consult({text: 'cHaraMber alwhna'});
assert(harambeTest2);
assert.equal(harambeTest2.length, 1);
assert.equal(harambeTest2[0].text, 'Dicks out for Harambe!');

var harambeTest3 = harambe.consult({text: 'nothing :('});
assert.equal(harambeTest3.length, 0);

var harambeTest4 = harambe.consult({text: 'nothing', name: 'I am harambe!'});
assert(harambeTest4);
assert.equal(harambeTest4.length, 1);
assert.equal(harambeTest4[0].text, 'Harambe lives!');

var harambeTest5 = harambe.consult({text: 'aaaharambea', name: 'I am harambe!'});
assert(harambeTest5);
checkMessages(harambeTest5,
    {text: 'Harambe lives!'},
    {text: 'Dicks out for Harambe!'}
);

// test Art Kalb bot

var artkalbTest1 = artkalb.consult({text: 'nothing :('});
assert(!artkalbTest1);

var artkalbTest2 = artkalb.consult({text: 'abcer'});
assert(!artkalbTest2);

var artkalbTest3 = artkalb.consult({text: 'NaIler wiper'});
assert(artkalbTest3);
assert.equal(artkalbTest3.text, 'NaIler? I hardly know her!');

var artkalbTest4 = artkalb.consult({text: 'creater'});
assert(!artkalbTest4);

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
        {'text': 'harambe translator'}
    );
}).then(function(msgs) {
    checkMessages(msgs,
        {text: 'Dicks out for Harambe!'},
        {text: 'translator? I hardly know her!'}
    );
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
        {'text': 'harambe translator', 'name': 'harambee'}
    );
}).then(function(msgs) {
    checkMessages(msgs,
        {text: 'harambe: Dicks out for Harambe!', bot_id: 'debugid'},
        {text: 'harambe: Harambe lives!', bot_id: 'debugid'},
        {text: 'artkalb: translator? I hardly know her!', bot_id: 'debugid'}
    );
}).then(function() {
    return testRequest(
        '/artkalb?debug',
        {'text': 'blahblah vibrator'}
    );
}).then(function(msgs) {
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].text, 'artkalb: BlahBlahBlah? I hardly know her!');
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
}).catch(function (err) {
    console.error(err);
});
