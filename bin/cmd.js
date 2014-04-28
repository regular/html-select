#!/usr/bin/env node

var select = require('../');
var split = require('split');
var fs = require('fs');

var selector = process.argv.slice(2).join(' ');

process.stdin
    .pipe(split(parseLine))
    .pipe(select(selector, function (e) {
        console.log(JSON.stringify(e));
    }))
;

function parseLine (s) {
    if (!/\S/.test(s)) return;
    var parts = JSON.parse(s);
    return [ parts[0], Buffer(parts[1]) ];
}
