# groupme-bot
A package that defines various classes that can be used to define and organize functionality for GroupMe bots. The groupme-bot package has the following exports:

* `Bot`: A class that can be used as a base for defining functionality of a GroupMe bot.
* `BotGroup`: A class that can be used for organizing a collection of bots, such that the bots can be treated as one collective "unit", or can be referenced by their names.
* `Message`: A message sent by a bot. This is an abstract form of an outgoing GroupMe message.
* `botRouter`: A function that takes a `BotGroup` and returns an expressjs `Router` object that can be used as an endpoint for the GroupMe bot API.
* `groupmeServices`: A collection of functions for communicating with the GroupMe API.
* `bots`: A collection of example bots with a variety of functions and behaviors.

A more detailed explanation of each exported object can be found below.

## Bot
The `Bot` class is used as a base class for defining bot functionality. A bot has the following things:

 * `name`: A readable name for the bot
 *  `id`: The GroupMe bot ID, used to post messages
 * `options`: An object specifying any tweakable parameters for the bot
 * `consult()`: A function used to notify the bot of incoming messages, so the bot can respond accordingly. This function must be overridden by a subclass of `Bot`.

A `Bot` fires a `'message'` event whenever it wants to post a message, with the content of the event being a `Message` object. The `post()`, `postDelayed()`, and `postTime()` are used to trigger this event.

The constructor for a subclass of `Bot` should follow a standard format. The constructor must take two arguments, the first argument being the bot id, and the second argument being the `options` object. This is necessary in order for the `clone()` functions of the `Bot` and `BotGroup` classes to work.

## BotGroup
A BotGroup is used to organize several bots together, and define callback function to use whenever a bot sends a message. The constructor for `BotGroup` takes a varargs list of `Bot`s.

`BotGroup` listens for `'message'` events from any of the bots it is created with, and simply re-emits these events. This makes it easy to listen for a `'message'` event from any of a number of bots, simply by creating a `BotGroup` from those bots and then listening for `'message'` events from the `BotGroup`.

The `consult()` and `consultAll()` functions are used to send an incoming message to either one bot (referenced by name), or to all bots in the group.

## botRouter
The botRouter function allows for the creation of an express.js Router that may run several bots simultaneously.

the botRunner function takes a `BotGroup` as its only argument, and returns an expressjs  `Router` object. For any bot in the `BotGroup`, POST requests through the router to the path `/[bot.name]` will be directed to the bot.

## groupmeServices
The `groupmeServices` object defines the following functions for communicating with the GroupMe API:

* `postBotMessage`: takes a `Message` object as its only argument, and sends that `Message` to the GroupMe bot message posting endpoint.
* `uploadImagePNG`: takes a PNG image `Buffer` as its first argument, and a GroupMe access token as its second argument, uploads the image to GroupMe's image hosting service, and resolves to the resulting URL for the image.