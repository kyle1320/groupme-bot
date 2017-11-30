'use strict';

const express = require('express');
const bodyParser = require('body-parser');

// a botRouter listens for POST requests and calls the appropriate bots.
function botRouter(botGroup) {
  const router = new express.Router();

  router.use(bodyParser.json());
  router.post('/:botName', function(req, res) {
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