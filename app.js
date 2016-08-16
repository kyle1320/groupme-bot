const https = require('https');
const BotRunner = require('./botrunner');

const postOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

function submit(body) {
    var req = https.request(postOptions);
    req.end(JSON.stringify(body));
}

// runner? I hardly know her!
const runner = new BotRunner(submit, {
    verbose: process.env.BOT_VERBOSE,
    debugBotId: process.env.DEBUG_BOT_ID
});

runner.addBot(require('./bots/harambe'));
runner.addBot(require('./bots/artkalb'));

runner.listen(process.env.PORT);
