'use strict';

module.exports = {
    help: undefined,
    test: require('./test'),
    links: require('./links'),
    eboard: require('./eboard'),
    free: require('./free'),
    events: require('./events'),
    eval: require('./eval')
};

// we must require help separately, since it uses the commands object.
module.exports.help = require('./help');