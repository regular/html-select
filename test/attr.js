var select = require('../');
var test = require('tape');
var through = require('through2');

test('quoted attribute', function (t) {
    var expected = [
        [ 'open', '<input type="text">' ]
    ];
    t.plan(expected.length);
    var s = select();
    var e = s.select('input[type="text"]');
    e.createReadStream()
        .pipe(through.obj(function (row, enc, next) {
            t.deepEqual(row, expected.shift());
            next();
        }))
    ;
    
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});

test('bare attribute', function (t) {
    t.plan(2);
    var s = select('input[type=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('mixed case attribute', function (t) {
    t.plan(2);
    var s = select('input[type=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input tYPe="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('mixed case [attribute]', function (t) {
    t.plan(2);
    var s = select('input[TypE=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('trailing whitespace attribute', function (t) {
    t.plan(2);
    var s = select('input[TypE=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text', value: 'xyz' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text" value ="xyz">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('attribute extra whitespace', function (t) {
    t.plan(2);
    var s = select('input[TypE=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text', value: 'xyz' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text"   value   =     xyz    >' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('attribute whitespace around quotes', function (t) {
    t.plan(2);
    var s = select('input[TypE=text]', function (e) {
        t.equal(e.name, 'input');
        t.deepEqual(e.attributes, { type: 'text', value: 'xyz' });
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text"   value   =     "xyz"    >' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});
