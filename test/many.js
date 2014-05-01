var select = require('../');
var test = require('tape');
var concat = require('concat-stream');

test('many read streams', function (t) {
    var expected = [
        { name: 'b', attributes: {}, body: 'beep boop' },
        { name: 'b', attributes: { x: '555' }, body: 'eek' },
    ];
    t.plan(6);
    var s = select('div b', function (e) {
        var x = expected.shift();
        t.equal(e.name, x.name);
        t.deepEqual(e.attributes, x.attributes);
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), x.body);
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
});
