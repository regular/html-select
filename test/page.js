var select = require('../');
var test = require('tape');
var tokenize = require('html-tokenize');
var fs = require('fs');

test('page .content', function (t) {
    t.plan(2);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.content', function (e) {
            t.equal(e.name, 'div');
            t.deepEqual(e.attributes, { class: 'content' });
        }))
    ;
});

test('page *', function (t) {
    t.plan(4);
    var expected = [
        { name: 'span', attributes: { class: 'greeting' } },
        { name: 'span', attributes: { class: 'name' } }
    ];
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.content *', function (e) {
            var x = expected.shift();
            t.equal(e.name, x.name);
            t.deepEqual(e.attributes, x.attributes);
        }))
    ;
});

test('page div.content', function (t) {
    t.plan(2);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('div.content', function (e) {
            t.equal(e.name, 'div');
            t.deepEqual(e.attributes, { class: 'content' });
        }))
    ;
});

test('page .name', function (t) {
    t.plan(4);
    var expected = [
        { name: 'h1', attributes: { class: 'name' } },
        { name: 'span', attributes: { class: 'name' } }
    ];
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.name', function (e) {
            var x = expected.shift();
            t.equal(e.name, x.name);
            t.deepEqual(e.attributes, x.attributes);
        }))
    ;
});


test('page span.greeting', function (t) {
    t.plan(2);
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('span.greeting', function (e) {
            t.equal(e.name, 'span');
            t.deepEqual(e.attributes, { class: 'greeting' });
        }))
    ;
});

test('page .content span', function (t) {
    t.plan(4);
    
    var expected = [
        { name: 'span', attributes: { class: 'greeting' } },
        { name: 'span', attributes: { class: 'name' } }
    ];
    fs.createReadStream(__dirname + '/page/index.html')
        .pipe(tokenize())
        .pipe(select('.content span', function (e) {
            var x = expected.shift();
            t.equal(e.name, x.name);
            t.deepEqual(e.attributes, x.attributes);
        }))
    ;
});
