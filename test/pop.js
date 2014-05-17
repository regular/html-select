var select = require('../');
var test = require('tape');
var through = require('through2');

/*
test('more closes than opens', function (t) {
    var expected = [
        [ 'open', '<b>' ],
        [ 'text', 'beep boop' ],
        [ 'close', '</b>' ]
    ];
    t.plan(expected.length);
    var s = select('div b', function (e) {
        e.createReadStream().pipe(through.obj(function (row, enc, next) {
            t.deepEqual(row, expected.shift());
            next();
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</quote>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});
*/

test('implicit close', function (t) {
    var expected = [
        [ 'open', '<b>' ],
        [ 'text', 'beep boop' ]
    ];
    t.plan(expected.length);
    var s = select('div b', function (e) {
        e.createReadStream().pipe(through.obj(function (row, enc, next) {
            t.deepEqual(row, expected.shift());
            next();
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});
return;
test('implicit close outer content', function (t) {
    var expected = [
        [ 'open', '<div>' ],
        [ 'open', '<b>' ],
        [ 'text', 'beep boop' ],
        [ 'close', '</div>' ]
    ];
    t.plan(expected.length);
    var s = select('div', function (e) {
        e.createReadStream().pipe(through.obj(function (row, enc, next) {
            t.deepEqual(row, expected.shift());
            next();
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});
