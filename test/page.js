var select = require('../');
var test = require('tape');
var tokenize = require('html-tokenize');
var fs = require('fs');

test('page .content', function (t) {
    t.plan(1);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.content', function (e) {
            t.deepEqual(e, { name: 'div', attributes: { class: 'content' } });
        }))
    ;
});

test('page div.content', function (t) {
    t.plan(1);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('div.content', function (e) {
            t.deepEqual(e, { name: 'div', attributes: { class: 'content' } });
        }))
    ;
});

test('page .name', function (t) {
    t.plan(2);
    var expected = [
        { name: 'h1', attributes: { class: 'name' } },
        { name: 'span', attributes: { class: 'name' } }
    ];
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.name', function (e) {
            t.deepEqual(e, expected.shift());
        }))
    ;
});


test('page span.greeting', function (t) {
    t.plan(1);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('span.greeting', function (e) {
            t.deepEqual(e, { name: 'span', attributes: { class: 'greeting' } });
        }))
    ;
});

test('page .content span', function (t) {
    t.plan(2);
    
    var expected = [
        { name: 'span', attributes: { class: 'greeting' } },
        { name: 'span', attributes: { class: 'name' } }
    ];
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.content span', function (e) {
            t.deepEqual(e, expected.shift());
        }))
    ;
});
