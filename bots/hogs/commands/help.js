'use strict';

const commands = require('./index');

module.exports = function (args) {

    // give specific command information
    if (args.length) {
        var cmd = args[0];

        // remove leading ! or /
        if (/^[!\/]/.test(cmd)) {
            cmd = cmd.substring(1);
        }

        if (cmd in commands) {
            return '!' + cmd + ' : ' + commands[cmd].helpString;
        } else {
            return 'Command not found: ' + cmd;
        }

    // list available commands
    } else {
        var helpStr = 'Available commands are:\n\n';
        for (var cmd in commands) {
            helpStr += '!' + cmd + ', ';
        }
        return helpStr.substring(0, helpStr.length - 2) +
            '\n\nFor help on a specific command, use "!help [command]".';
    }
};

module.exports.helpString =
`Provides information about available commands.
Usage: !help [command]
If command is given, prints help for that command.`;