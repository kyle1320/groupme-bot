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

const runner = new BotRunner(submit);