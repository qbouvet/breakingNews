var fs = require('fs');
var $ = jQuery = require('jquery');
require('jquery-csv');

var events = './data/oct25_15000_events.csv';


// Just print lines
fs.readFile(events, 'UTF-8', function (err, csv) {

    if (err) { console.log(err); }

    $.csv.toArrays(csv, {}, function (err, data) {

        if (err) { console.log(err); }

        for (var i = 0, len = data.length; i < len; i++) {
            console.log(data[i]);
        }

    });
});