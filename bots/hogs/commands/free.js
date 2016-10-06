'use strict';

var util = require('./util');
var twitter = require('twitter')({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    bearer_token: process.env.TWITTER_API_TOKEN
});

module.exports = function (args) {
    return new Promise(function (resolve, reject) {
        twitter.get('statuses/user_timeline', {screen_name: 'RITFreeFood'}, function(err, tweets) {
            if (err) reject(err)
            else {
                var text = tweets[0].text;
                var date = new Date(tweets[0].created_at);

                resolve(util.formatDate(date) + '\n' + text);
            }
        });
    });
}

module.exports.helpString =
`Shows the most recent post by @RITFreeFood on Twitter.`