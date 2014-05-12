var select = require('../');
var test = require('tape');
var concat = require('concat-stream');

test('more closes than opens', function (t) {
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
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</quote>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('implicit close', function (t) {
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
    s.write([ 'close', '</div>' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
});

test('implicit close outer content', function (t) {
    t.end();
    return console.error('SKIPPING');
    
    t.plan(2);
    var s = select('div', function (e) {
        t.equal(e.name, 'div');
        e.createReadStream().pipe(concat(function (body) {
            t.equal(body.toString('utf8'), '<b>beep boop');
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
});
