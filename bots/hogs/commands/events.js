'use strict';

var https = require('https');
var util = require('./util');

var calendarID = process.env.HOGS_CALENDAR_ID;
var key = process.env.GOOGLE_API_KEY;

module.exports = function (args) {

    // first argument is number of events to show.
    // Defaults to 1, max value is 5.
    var eventsToShow = Math.min(Math.max(parseInt(args[0]) || 0, 1), 5);

    return new Promise(function (resolve, reject) {
        var eventsURL =
            'https://www.googleapis.com/calendar/v3/calendars/'+
            calendarID+'/events?singleEvents=true&orderBy=startTime&maxResults='+
            eventsToShow+'&key='+key+'&timeMin='+(new Date().toISOString());

        https.get(eventsURL, function (res) {
            var body = '';

            // build the response chunk by chunk
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function () {
                try {
                    var events = JSON.parse(body).items;

                    if (!events.length) {
                        return resolve('There are no scheduled events.');
                    }

                    // if there are less than the requested number of events,
                    // only show that many.
                    eventsToShow = Math.min(eventsToShow, events.length);

                    // header text
                    var info = 'The next ' +
                        (eventsToShow === 1
                            ? 'scheduled event is:'
                            : eventsToShow + ' scheduled events are:');

                    // show the summary, time & location for each event.
                    for (var i = 0; i < eventsToShow; i++) {

                        // add spacing between the events
                        if (i > 0) info += '\n';

                        info += '\n  ' + events[i].summary +
                        '\n  ' + util.formatDate(new Date(events[i].start.dateTime));

                        if (events[i].location) {
                            info += '\n  '+events[i].location;
                        }
                    }

                    resolve(info);
                } catch (e) {
                    console.log(body);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

module.exports.helpString =
`Fetches and displays the next upcoming event on the HOGS calendar.
Usage: events [numberOfEvents]
where numberOfEvents is the number of events to show, up to five.`;