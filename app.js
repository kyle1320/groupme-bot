const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const harambe = require('./bots/harambe');
const artkalb = require('./bots/artkalb');

const postOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

const app = express();

app.use(bodyParser.json());

app.post('/harambe', consult(harambe));
app.post('/artkalb', consult(artkalb));

function consult(bot) {
    return function(req, res) {
        if (process.env.BOT_DEBUG) {
            for (var key in process.env) {
                if (!key.startsWith('npm_')) {
                    console.log(key, process.env[key]);
                }
            }
            console.log('message', req.body, 'to', bot.name);
        }

        // make sure we don't get any infinite bot loops...
        if (req.body.sender_type !== 'bot') {
            if (botEnabled(bot)) {
                bot.consult(req.body, say);
            }
        }

        res.end();
    };
}

function botEnabled(bot) {
    return new RegExp(bot.name, 'gi').test(process.env.BOT_MODES);
}

function say(msg, bot) {
    var body = {
        'bot_id': bot.getId(),
        'text': msg
    };

    if (process.env.BOT_DEBUG) {
        console.log('response', msg, 'from', bot.name);
        body.bot_id = process.env.DEBUG_BOT_ID;
    }

    var req = https.request(postOptions);
    req.end(JSON.stringify(body));
}

var port = process.env.PORT || 3000;
app.listen(port);

module.exports = {say: say, consult: consult, botEnabled: botEnabled};