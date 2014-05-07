var select = require('../');
var test = require('tape');
var tokenize = require('html-tokenize');
var concat = require('concat-stream');
var fs = require('fs');

var names = [
    'echojs',
    'echojs',
    'efcl',
    'efcl',
    'efcl',
    'aneesha',
    'echojs',
    '紫云飞',
    '紫云飞',
    '紫云飞',
    'carldanley',
    'eskimoblood',
    'pazguille',
    'echojs',
    'echojs',
    '紫云飞',
    'carldanley',
    '紫云飞',
    'echojs',
    'eskimoblood',
    '紫云飞',
    '紫云飞',
    '紫云飞',
    'carldanley',
    '紫云飞',
    '紫云飞',
    'echojs',
    'echojs',
    'echojs'
];

var expected = [];
for (var i = 0; i < names.length; i++) {
    expected.push(names[i]);
    expected.push('discuss');
}
expected.push('echojs');
expected.push('1 comment');

test('article', function (t) {
    t.plan(expected.length * 2);
    fs.createReadStream(__dirname + '/article/index.html')
        .pipe(tokenize())
        .pipe(select('article username a[href]', function (e) {
            t.equal(e.name, 'a');
            e.createReadStream().pipe(concat(function (body) {
                t.equal(body.toString(), expected.shift(), body+'');
            }));
        }))
    ;
});
