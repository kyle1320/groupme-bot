'use strict';

module.exports = {
    help: undefined,
    links:    require('./links'),
    free:     require('./free'),
    events:   require('./events'),
    calc:     require('./calc'),
    feedback: require('./feedback')
};

// we must require help separately, since it uses the commands object.
module.exports.help = require('./help');