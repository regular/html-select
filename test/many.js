var select = require('../');
var test = require('tape');
var through = require('through2');

test('many read streams', function (t) {
    var expected = [
        [ 'open', '<b>' ],
        [ 'text', 'beep boop' ],
        [ 'close', '</b>' ],
        [ 'open', '<b x=555>' ],
        [ 'text', 'eek' ],
        [ 'close', '</b>' ]
    ];
    t.plan(expected.length + 2);
    var s = select().select('div b', function (e) {
        e.on('close', function () { t.ok(true, 'closed') });
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
    s.write([ 'close', '<div>' ]);
    
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<h1>' ]);
    s.write([ 'text', 'whatever' ]);
    s.write([ 'close', '</h1>' ]);
    s.write([ 'close', '<div>' ]);
    
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b x=555>' ]);
    s.write([ 'text', 'eek' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});
