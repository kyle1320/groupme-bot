'use strict';

var vm = require('vm');

module.exports = function (args) {
    var code = args.join(' ');
    var val;

    try {
        val = String(vm.runInNewContext(code, getContext(), {timeout: 100}))
    } catch (e) {
        val = e;
    }

    return '>>> '+code+'\n'+val;
};

module.exports.helpString =
`Evaluates the given text as JavaScript, and prints the result.`;

function getContext() {
    const context = Object.create(Math);

    context.range = function*(arg0 = Infinity, arg1, arg2) {
        var min, max, skip;

        if (typeof arg1 !== 'number') {
            min = 0;
            max = arg0;
        } else {
            min = arg0;
            max = arg1;
        }

        if (typeof arg2 !== 'number') skip = Math.sign(max - min);
        else                          skip = arg2

        const direction = Math.sign(skip);

        while (Math.sign(max - min) === direction) {
            yield min;
            min += skip;
        }
    };

    context.sum = function(...values) {
        var sum = 0;
        for (var item of flatmap(values)) sum += item;
        return sum;
    };

    function isIterable(obj) {
        if (obj == null) return false;
        return typeof obj[Symbol.iterator] === 'function';
    }

    function* flatmap(values) {
        for (var item of values) {
            if (isIterable(item)) yield* item;
            else                  yield  item;
        }
    }

    return context;
}