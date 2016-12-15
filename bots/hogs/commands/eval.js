'use strict';

var vm = require('vm');

module.exports = function (args) {
    var code = args.join(' ');
    var val;

    try {
        val = String(vm.runInNewContext(code, Math, {timeout: 100}))
    } catch (e) {
        val = e;
    }

    return '>>> '+code+'\n'+val;
};

module.exports.helpString =
`Evaluates the given text as JavaScript, and prints the result.`;