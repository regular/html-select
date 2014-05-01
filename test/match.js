var select = require('../');
var test = require('tape');
var concat = require('concat-stream');

test('match once', function (t) {
    t.plan(1);
    var s = select('div b', function (e) {
        t.equal(e.name, 'b');
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'text', 'whoa' ]);
    s.write([ 'close', '</div>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});
