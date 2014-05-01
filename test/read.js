var select = require('../');
var test = require('tape');
var concat = require('concat-stream');

test('read stream', function (t) {
    t.plan(2);
    var s = select('div b', function (e) {
        t.equal(e.name, 'b');
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), 'beep boop');
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('more read stream', function (t) {
    t.plan(2);
    var s = select('div b', function (e) {
        t.equal(e.name, 'b');
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), 'beep boop');
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'text', 'whoa' ]);
    s.write([ 'open', '</div>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('outer read stream', function (t) {
    t.plan(2);
    var s = select('div b', function (e) {
        t.equal(e.name, 'b');
        e.createReadStream({ outer: true }).pipe(concat(function (body) {
            t.equal(body.toString('utf8'), '<b>beep boop</b>');
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});
