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
        var helpStr = 'These commands are available for use:\n\n';
        for (var cmd in commands) {
            helpStr += '!' + cmd + ', ';
        }
        return helpStr.substring(0, helpStr.length - 2) +
            '\n\nFor information about a specific command, use "!help [command]".';
    }
};

module.exports.helpString = `
Provides usage information about available commands.
Usage: !help [command]
If command is specified, prints information specific to the given command.
Otherwise, prints a list of available commands.`;