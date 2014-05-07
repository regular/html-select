var select = require('../');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var concat = require('concat-stream');
var tokenize = require('html-tokenize');

test('child selector', function (t) {
    t.plan(2);
    var s = select('.c > input[type=text]', function (e) {
        t.equal(e.name, 'input');
        t.equal(e.attributes.value, 'abc');
    });
    readStream('child/index.html').pipe(tokenize()).pipe(s);
});

test('child selector non-immediate descendant', function (t) {
    t.plan(2);
    var s = select('.b > .e', function (e) {
        t.equal(e.name, 'div');
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), 'xyz');
        }));
    });
    readStream('child/index.html').pipe(tokenize()).pipe(s);
});

test('child no-match selector', function (t) {
    var s = select('.b > input[type=text]', function (e) {
        t.fail('should not have matched');
    });
    readStream('child/index.html').pipe(tokenize()).pipe(s);
    s.on('finish', function () { t.end() });
});

test('child start then no match selector', function (t) {
    var s = select('.b > .d', function (e) {
        t.fail('should not have matched');
    });
    readStream('child/index.html').pipe(tokenize()).pipe(s);
    s.on('finish', function () { t.end() });
});

function readStream (file) {
    return fs.createReadStream(path.join(__dirname, file));
}
