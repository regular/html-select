var select = require('../');
var tokenize = require('html-tokenize');
var fs = require('fs');

var selector = process.argv.slice(2).join(' ');

process.stdin.pipe(tokenize())
    .pipe(select(selector, function (e) {
        console.log(JSON.stringify(e));
    }))
;
