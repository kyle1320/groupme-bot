const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const postOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

const app = express();

app.use(bodyParser.json());

app.post('/groupme', function(req, res) {
    console.log(req.body);

    if (req.body.text.match(/harambe/i)) {
        say('Dicks out for Harambe!');
    }

    res.end();
});

function say(msg) {
    var body = {
        'bot_id': process.env.BOT_ID,
        'text': msg
    };

    var req = https.request(postOptions);
    req.end(JSON.stringify(body));
}

say('hello');

var port = process.env.PORT || 3000;
app.listen(port);