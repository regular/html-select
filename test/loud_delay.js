var test = require('tape');
var select = require('../');
var tokenize = require('html-tokenize');
var through = require('through2');
var fs = require('fs');

var expected = fs.readFileSync(__dirname + '/loud_delay/expected.html', 'utf8');

test('loud delay', function (t) {
    t.plan(1);
    var s = select();
    
    s.select('.loud', function (elem) {
        var loud = elem.createStream();
        loud.pipe(through(function (buf) {
            var self = this;
            setTimeout(function () {
                self.queue(buf.toString().toUpperCase());
            }, 10);
        })).pipe(loud);
    });
    
    fs.createReadStream(__dirname + '/loud_delay/input.html')
        .pipe(tokenize())
        .pipe(s)
        .pipe(through.obj(function (row, enc, next) {
            console.error([ row[0], row[1].toString('utf8') ]);
            next();
        }))
    ;
});
