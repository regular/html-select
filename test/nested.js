var select = require('../');
var test = require('tape');
var through = require('through2');

test('nested matches', function (t) {
    var expected = [
        [
            [ 'open', '<div>' ],
            [ 'open', '<b>' ],
            [ 'text', 'beep boop' ],
            [ 'close', '</b>' ],
            [ 'text', '\n' ],
            [ 'open', '<div class="x">' ],
            [ 'text', 'woo' ],
            [ 'close', '</div>' ],
            [ 'text', '\n' ],
            [ 'close', '</div>' ]
        ],
        [
            [ 'open', '<div class="x">' ],
            [ 'text', 'woo' ],
            [ 'close', '</div>' ]
        ]
    ];
    t.plan(expected[0].length + expected[1].length);
    var s = select('div', function (e) {
        var ex = expected.shift();
        e.createReadStream().pipe(through.obj(function (row, enc, next) {
            t.deepEqual(row, ex.shift());
            next();
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'text', '\n' ]);
    s.write([ 'open', '<div class="x">' ]);
    s.write([ 'text', 'woo' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'text', '\n' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    s.resume();
});
