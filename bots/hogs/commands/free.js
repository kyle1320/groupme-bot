'use strict';

var util = require('../../../util');
var twitter = require('twitter');

module.exports = function (args, msg, options) {
    var twitterApi = twitter({
        consumer_key: options.twitterApiKey,
        consumer_secret: options.twitterApiSecret,
        bearer_token: options.twitterApiToken
    });

    return new Promise(function (resolve, reject) {
        twitterApi.get(
            'statuses/user_timeline',
            {screen_name: 'RITFreeFood'},
            function(err, tweets) {
                if (err) reject(err)
                else {
                    var text = tweets[0].text;
                    var date = new Date(tweets[0].created_at);

                    resolve(util.formatDate(date) + '\n' + text);
                }
            }
        );
    });
}

module.exports.helpString =
`Shows the most recent post by @RITFreeFood on Twitter.`