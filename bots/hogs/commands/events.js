'use strict';

var https = require('https');
var time = require('time');

var calendarID = process.env.HOGS_CALENDAR_ID;
var key = process.env.GOOGLE_API_KEY;

var dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
var monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

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
                        '\n  ' + formatDate(new time.Date(events[i].start.dateTime));

                        if (events[i].location) {
                            info += '\n  '+events[i].location;
                        }
                    }

                    resolve(info);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// formats the given date in the format
// (day) at (time), where (day) is:
//     "Today", if the date is the same as the current date
//     "(dayname)", if the date is within the next 5 days
//     "(dayname), (month) (date)", otherwise.
// and (time) is "H:MM(AM or PM)" or just "H(AM or PM)".
function formatDate(then) {

    // Use eastern time
    then.setTimezone('America/New_York');

    var now = new Date();
    var diff = then.getTime() - now.getTime();
    var date, time;

    if (diff < 1000 * 60 * 60 * 24 * 5) {
        if (then.getDate() === now.getDate()) {
            date = 'Today';
        } else {
            date = dayNames[then.getDay()];
        }
    } else {
        date = dayNames[then.getDay()] + ', '  +
            monthNames[then.getMonth()] + ' ' +
            then.getDate();
    }

    var hr = (then.getHours() % 12) || 12;
    var pd = then.getHours() < 12 ? 'AM' : 'PM';
    var min = then.getMinutes();

    time = hr + (min ? ':' + ('0' + min).slice(-2) : '') + pd;

    return date + ' at ' + time;
}

module.exports.helpString =
`Fetches and displays the next upcoming event on the HOGS calendar.
Usage: events [numberOfEvents]
where numberOfEvents is the number of events to show, up to five.`;