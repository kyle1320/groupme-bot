# groupme-bot
Runs a Node.js server that allows "bots" to listen for, and reply to, GroupMe messages. The main program can be started using the command `node app.js`, or optionally, `node start`.

## Bots
Bots provide the mechanism to parse and reply to posted messages. Bots should extend the prototype provided by /bots/bot.js. Bots have the following properties:

  * **name:** A unique identifier for the bot. This is the path a POST request must follow to reach this bot, so it must be a valid URL path.
  * **id:** The GroupMe bot ID to use when posting
  * **consult:** A function that takes a GroupMe message to be processed. Must be overridden by subclasses.
  * **post, postDelayed, and postTime:** Posts a message on this bot's behalf, optionally after some delay or at a specific time. Should be called by the bot's `consult` function. Takes the message to be posted. These are some common properties of the message object:
    * **text:** The text to display in the posted message

A Bot constructor should take two arguments:
  * **id:** The bot's ID (as described above)
  * **submit:** The function to be called when the bot posts a message. Should handle "posting" of the message (such as sending the message to GroupMe).

## BotRunner
The BotRunner module allows for the instantiation of a server that may run several bots simultaneously.

Bots can be registered by calling `BotRunner.addBot(bot)`. Once a bot is registered, POST requests to the path `/[bot.name]` will be directed to the bot.

The server can be started by calling `BotRunner.listen(port)`, and may be stopped by calling `BotRunner.close()`.

## Debugging
Verbose logging can be enabled by setting the environment variable `BOT_VERBOSE` to any non-empty string.

With verbose logging enabled, information such as received / sent messages are displayed to `stdout`.