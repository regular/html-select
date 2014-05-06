var select = require('../');
var test = require('tape');
var tokenize = require('html-tokenize');
var fs = require('fs');

test('article', function (t) {
    t.plan(2);
    var expected = '<a href="/user/echojs">echojs</a>';
    fs.createReadStream(__dirname + '/article/index.html')
        .pipe(tokenize())
        .pipe(select('article username', function (e) {
            t.equal(e.name, 'username');
            e.createReadStream().pipe(concat(function (body) {
                t.equal(body.toString(), expected);
            }));
        }))
    ;
});
