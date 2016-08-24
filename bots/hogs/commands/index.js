module.exports = {
    help: undefined,
    test: require('./test'),
    links: require('./links')
};

// we must require help separately, since it uses the commands object.
module.exports.help = require('./help');