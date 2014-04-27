var select = require('../');
var tokenize = require('html-tokenize');
var fs = require('fs');

fs.createReadStream(__dirname + '/page.html')
    .pipe(tokenize())
    .pipe(select('span.greeting', function (e) {
        console.log('matched:', e);
    }))
;
