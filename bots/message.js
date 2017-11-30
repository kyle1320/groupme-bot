'use strict';

function message(bot, text, imageUrl) {
  return {
    botName: bot.name,
    botId: bot.id,
    text,
    imageUrl
  };
}

module.exports = message;