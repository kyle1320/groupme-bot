const express = require('express');

const app = express();

const postOptions = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

app.post('/groupme', function(req, res) {
    var msg = JSON.parse(req.body);

    if (msg.text.match(/harambe/i)) {
        say('Dicks out for Harambe!');
    }

    res.end();
});

function say(msg) {
    var body = {
        'bot_id': process.env.BOT_ID,
        'text': msg
    };

    http.request(postOptions).end(body);
}

var port = process.env.PORT || 3000;
app.listen(port);