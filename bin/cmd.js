#!/usr/bin/env node

var select = require('../');
var split = require('split');
var tokenize = require('html-tokenize');
var fs = require('fs');

var selector = process.argv.slice(2).join(' ');

process.stdin
    .pipe(split(parseLine))
    .pipe(select(selector, function (e) {
        console.log(JSON.stringify(e));
    }))
;

function parseLine (s) {
    if (/\S/.test(s)) return JSON.parse(s);
}
