var select = require('../');
var test = require('tape');
var tokenize = require('html-tokenize');
var concat = require('concat-stream');
var fs = require('fs');

var expected = [];
for (var i = 0; i < 32; i++) expected.push('echojs');

test('article', function (t) {
    t.plan(2 * expected.length);
    fs.createReadStream(__dirname + '/article/index.html')
        .pipe(tokenize())
        .pipe(select('article username a[href]', function (e) {
            t.equal(e.name, 'a');
            e.createReadStream().pipe(concat(function (body) {
                t.equal(body.toString(), expected.shift());
            }));
        }))
    ;
});
