var select = require('../');
var test = require('tape');

test('quoted attribute', function (t) {
    t.plan(2);
    var s = select('input[type="text"]', function (e) {
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
