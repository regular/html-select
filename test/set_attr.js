var select = require('../');
var test = require('tape');
var through = require('through2');

test('set an attribute', function (t) {
    var expected = [
        [ 'open', '<html>' ],
        [ 'open', '<body>' ],
        [ 'open', '<input type="submit">' ],
        [ 'open', '<input type="text" value="beep boop">' ],
        [ 'close', '</body>' ],
        [ 'close', '</html>' ]
    ];
    
    t.plan(expected.length);
    var s = select().select('input[type="text"]', function (e) {
        e.setAttribute('value', 'beep boop');
    });
    
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    
    s.pipe(through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift());
        next();
    }));
});
