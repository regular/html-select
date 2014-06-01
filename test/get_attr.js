var select = require('../');
var test = require('tape');
var through = require('through2');

test('set an attribute', function (t) {
    var expected = [ 'submit', 'text' ];
    t.plan(expected.length);
    
    var s = select().select('input', function (e) {
        t.equal(e.getAttribute('type'), expected.shift());
    });
    
    s.write([ 'open', '<html>' ]);
    s.write([ 'open', '<body>' ]);
    s.write([ 'open', '<input type="submit">' ]);
    s.write([ 'open', '<input type="text">' ]);
    s.write([ 'close', '</body>' ]);
    s.write([ 'close', '</html>' ]);
    s.end();
    
    s.resume();
});
