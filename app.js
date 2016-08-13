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

app.post('/groupme', parseMessage);

function parseMessage(req, res) {
    if (process.env.BOT_DEBUG) {
        console.log('variables');
        for (var key in process.env) {
            if (!key.startsWith('npm_')) {
                console.log(key, process.env[key]);
            }
        }
        console.log('message', req.body);
    }

    // make sure we don't get any infinite bot loops...
    if (req.body.sender_type !== 'bot') {
        if (botEnabled('harambe')) {
            harambe.consult(req.body, say);
        }

        if (botEnabled('artkalb')) {
            artkalb.consult(req.body, say);
        }
    }

    res.end();
}

function botEnabled(mode) {
    return new RegExp(mode, 'gi').test(process.env.BOT_MODES);
}

function say(msg, bot_id) {
    if (process.env.BOT_DEBUG) {
        console.log('response', msg, 'from', bot_id);
        bot_id = process.env.DEBUGBOT_ID;
    }

    var body = {
        'bot_id': bot_id,
        'text': msg
    };

    var req = https.request(postOptions);
    req.end(JSON.stringify(body));
}

var port = process.env.PORT || 3000;
app.listen(port);