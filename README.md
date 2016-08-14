# groupme-bot
Runs a Node.js server that allows "bots" to listen for, and reply to, GroupMe messages. The main program can be started using the command `node app.js`, or optionally, `node start`.

## Bots
 Bots provide the mechanism to parse and reply to posted messages. Each bot module must have three exports:

   * **name:** A unique identifier for the bot. This is the path a POST request must follow to reach this bot, so it must be a valid URL path.
   * **id:** The GroupMe bot ID that this bot will use when posting.
   * **consult:** A function that takes a GroupMe message as its only argument, and may return nothing, if no message is to be posted, or may return an object with the following properties in order to post a message:
     * **text:** The text to display in the posted message

## BotRunner
 The BotRunner module allows for the instantiation of a server that may run several bots simultaneously.

 The BotRunner constructor takes two arguments:
   * **submit:** A function that takes a single argument `body` that is a message object compatible with the GroupMe API. This will be called any time a bot sends a message. This function should likely send a POST request to the API, but is provided in case other functionality is desired.
   * **options:** An object that specifies behavior options for this BotRunner. Valid keys are:
     * **debug:** Whether to enable Debug mode on the BotRunner
     * **debugBotId:** The GroupMe bot ID to use when messages are sent in Debug mode.

 Bots can be registered by calling `BotRunner.addBot(bot)`. Once a bot is registered, POST requests to the path `/[bot.name]` will be directed to the bot.

 POST requests to the path `/all` will go to all registered bots.

 The server must be started by calling `BotRunner.listen(port)`, and may be stopped by calling `BotRunner.close()`.

## Debugging
 Debug mode can be enabled by setting the environment variable `BOT_DEBUG` to any non-empty string.

 In Debug mode, information such as received / sent messages are displayed to `stdout`.

 In addition, when Debug mode is enabled, all outgoing messages will have their `bot_id` set to `process.env.DEBUG_BOT_ID`. This is to allow messages to be sent to a secondary chat group for testing purposes.