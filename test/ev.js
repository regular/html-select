var select = require('../');
var test = require('tape');
var concat = require('concat-stream');

test('events', function (t) {
    t.plan(4);
    var s = select('div b');
    s.on('match', function (e) {
        t.equal(e.name, 'b');
        t.deepEqual(e.attributes, { x: '5' });
        
        e.on('close', function () {
            t.ok(true, 'close event');
        });
        
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), 'beep boop');
        }));
    });
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<div>' ]);
    s.write([ 'open', '<b x=5>' ]);
    s.write([ 'text', 'beep boop' ]);
    s.write([ 'close', '</b>' ]);
    s.write([ 'close', '<div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});
