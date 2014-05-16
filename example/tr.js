var plex = require('../');
var split = require('split');
var through = require('through2');

var p = plex();
p.select('li', function (s) {
    var tr = through.obj(function (row, buf, next) {
        this.push([ row[0], String(row[1]).toUpperCase() ]);
        next();
    });
    tr.pipe(s.createStream()).pipe(tr);
});

process.stdin
    .pipe(split(parse))
    .pipe(p)
    .pipe(through.obj(function (row, enc, next) {
        this.push(JSON.stringify(row) + '\n');
        next();
    }))
    .pipe(process.stderr)
;

function parse (buf) {
    if (buf.length) return JSON.parse(buf.toString('utf8'));
}
