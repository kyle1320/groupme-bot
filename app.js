const express = require('express');

var app = express();

app.get('/', function(req, res) {
    res.end('success!');
});

app.get('/echo', function(req, res) {
    res.send(req.query);
    res.end();
});

app.post('/echo', function(req, res) {
    res.send(req.body);
    res.end();
});

var port = process.env.PORT || 3000;
app.listen(port);