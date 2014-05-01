var select = require('../');
var tokenize = require('html-tokenize');
var fs = require('fs');
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), { boolean: [ 'outer' ] });
var selector = argv._.join(' ');

process.stdin.pipe(tokenize())
    .pipe(select(selector, function (e) {
        e.createReadStream(argv).pipe(process.stdout);
    }))
;
