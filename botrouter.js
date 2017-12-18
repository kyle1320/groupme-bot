'use strict';

const express = require('express');
const bodyParser = require('body-parser');

// a botRouter listens for POST requests and calls the appropriate bots.
// requestKey is a string that clients must send as a query parameter
// in order for the request to be accepted.
function botRouter(botGroup, requestKey) {
  const router = new express.Router();

  router.use(bodyParser.json());
  router.post('/:botName', function(req, res) {

    // Heroku does not currently support client SSL certificate validation,
    // so there's no way to reliably verify whether the request is actually
    // coming from GroupMe's servers. So instead, we use a secret key sent in
    // the query string, and add that query parameter as part of the GroupMe
    // bot callback URL.
    // Note that this also means the client should definitely be using HTTPS,
    // because we don't want to leak this key. But even if it does happen,
    // we can still reset the key.
    if (requestKey && req.query.key != requestKey) {
      res.status(401); // Unauthorized
      res.end();
      return;
    }

    if (preprocess(req)) {
        botGroup.consult(req.params.botName, req.body);
    }

    res.end();
  });

  return router;
}

// processes the given request and determines whether it should
// go to a bot. Returns true if the request is bot-worthy, false otherwise.
function preprocess(req) {
  if (typeof req !== 'object') return false;
  if (typeof req.params !== 'object') return false;
  if (typeof req.params.botName !== 'string') return false;
  if (typeof req.body !== 'object') return false;
  if (typeof req.body.text !== 'string') return false;

  // make sure we don't get any infinite bot loops...
  if (req.body.sender_type === 'bot') {
      return false;
  }

  return true;
}

module.exports = botRouter;