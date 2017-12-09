'use strict';

module.exports = {
    BotGroup: require('./bots/botgroup'),
    Bot: require('./bots/bot'),
    Message: require('./bots/message'),
    bots: {
        Debug: require('./bots/debug'),
        Hogs: require('./bots/hogs'),
        Harambe: require('./bots/harambe'),
        ArtKalb: require('./bots/artkalb')
    },
    botRouter: require('./botrouter'),
    groupmeServices: require('./groupme-services')
};