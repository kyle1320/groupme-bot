'use strict';

const time = require('time');

const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// formats the given date in the format
// (day) at (time), where (day) is:
//     "Today", if the date is the same as the current date
//     "(dayname)", if the date is within the next 5 days
//     "(dayname), (month) (date)", otherwise.
// and (time) is "H:MM(AM or PM)" or just "H(AM or PM)".
module.exports.formatDate = function formatDate(then) {

    // Use eastern time
    then = new time.Date(then);
    then.setTimezone('America/New_York');

    var now = new Date();
    var diff = then.getTime() - now.getTime();
    var dateStr, timeStr;

    if (diff < 0 && diff > -1000 * 60 * 60 * 24 * 5) {
        if (then.getUTCDate() === now.getUTCDate()) {
            dateStr = 'Today';
        } else if ((then.getUTCDay() + 1) % 7 == now.getUTCDay() % 7) {
            dateStr = 'Yesterday';
        }
    } else if (diff > 0 && diff < 1000 * 60 * 60 * 24 * 5) {
        if (then.getUTCDate() === now.getUTCDate()) {
            dateStr = 'Today';
        } else if ((now.getUTCDay() + 1) % 7 == then.getUTCDay() % 7) {
            dateStr = 'Tomorrow';
        } else {
            dateStr = dayNames[then.getDay()];
        }
    }

    // default
    dateStr = dateStr || dayNames[then.getDay()] + ', '  +
            monthNames[then.getMonth()] + ' ' +
            then.getDate() + (now.getUTCFullYear() == then.getUTCFullYear()
                ? '' : ', ' + then.getFullYear());

    var hr = (then.getHours() % 12) || 12;
    var pd = then.getHours() < 12 ? 'AM' : 'PM';
    var min = then.getMinutes();

    timeStr = hr + (min ? ':' + ('0' + min).slice(-2) : '') + pd;

    return dateStr + ' at ' + timeStr;
};

module.exports.sleep = function(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
};