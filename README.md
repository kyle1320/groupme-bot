# groupme-bot
Runs a Node.js server that allows "bots" to listen for, and reply to, GroupMe messages. The main program can be started using the command `node app.js`, or optionally, `node start`.

## Bots
Bots provide the mechanism to parse and reply to posted messages. Bots should extend the prototype provided by /bots/bot.js, and include the following properties:

  * **name:** A unique identifier for the bot. This is the path a POST request must follow to reach this bot, so it must be a valid URL path.
  * **id:** The GroupMe bot ID to use when posting
  * **consult:** A function that takes a GroupMe message as its only argument, and may return nothing, if no message is to be posted, or may return a GroupMe compatible object in order to post a message. Must be overridden by subclasses. It may also return a Promise that resolves to ones of these values, in which case the message will be processed after the Promise is resolved. These are some common properties of the message object:
    * **text:** The text to display in the posted message

## BotRunner
The BotRunner module allows for the instantiation of a server that may run several bots simultaneously.

The BotRunner constructor takes two arguments:
  * **submit:** A function that takes a single argument `body` that is a message object compatible with the GroupMe API. This will be called any time a bot sends a message. This function should likely send a POST request to the API, but is provided in case other functionality is desired.
  * **options:** An object that specifies behavior options for this BotRunner. Valid keys are:
    * **verbose:** Whether to output logging messages such as received / sent messages, etc.
    * **debugBotId:** The GroupMe bot ID to use when messages are sent in debug mode (see below).

Bots can be registered by calling `BotRunner.addBot(bot)`. Once a bot is registered, POST requests to the path `/[bot.name]` will be directed to the bot.

POST requests to the path `/all` will go to all registered bots.

The server must be started by calling `BotRunner.listen(port)`, and may be stopped by calling `BotRunner.close()`.

## Debugging
Verbose logging can be enabled by setting the environment variable `BOT_VERBOSE` to any non-empty string.

With verbose logging enabled, information such as received / sent messages are displayed to `stdout`.

`POST` requests may include the query parameter `debug` set to any value in order to change output messages' `bot_id` property to `process.env.DEBUG_BOT_ID` before sending. This is useful for sending messages to a separate chat for testing purposes.
