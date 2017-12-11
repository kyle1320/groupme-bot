'use strict';

const EventEmitter = require('events');

module.exports = class BotGroup extends EventEmitter {
  constructor (...botList) {
    super();

    this.bots = [];
    this.botMap = new Map();

    botList.forEach(this.add.bind(this));
  }

  add(bot) {
    this.bots.push(bot);
    this.botMap.set(bot.name, bot);
    bot.on('message', this.emit.bind(this, 'message'));
  }

  // send the message only to bot with the given name (if it exists)
  consult(name, msg) {
    if (this.botMap.has(name)) {
      this.botMap.get(name).consult(msg);
    }
  }

  // send the message to all bots in this group
  consultAll(msg) {
    this.bots.forEach(bot => bot.consult(msg));
  }

  clone() {
    var botList = this.bots.map(bot => bot.clone())
    return new BotGroup(...botList)
  }
}