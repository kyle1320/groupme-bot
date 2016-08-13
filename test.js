process.env.BOT_DEBUG = 'true';
process.env.HARAMBE_BOT_ID = 'harambeid';
process.env.ARTKALB_BOT_ID = 'artkalbid';
process.env.DEBUG_BOT_ID = 'debugid';

var app = require('./app');
var harambe = require('./bots/harambe');
var artkalb = require('./bots/artkalb');

harambe.consult({text: 'harambe'}, app.say);
app.say('test', harambe);