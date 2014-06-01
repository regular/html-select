var parse = require('./parse_tag.js');

module.exports = function (buf, attrs) {
    var p = parse(buf);
    var xattrs = p.getAttributes();
    Object.keys(attrs).forEach(function (key) {
        xattrs[key] = attrs[key];
    });
    var keys = Object.keys(xattrs);
    var parts = keys.map(function (key) {
        if (attrs[key] === true) return key;
        return key + '="' + esc(xattrs[key]) + '"';
    }).join(' ');
    return '<' + p.name + (parts.length ? ' ' : '') + parts + '>';
};

function esc (s) {
    return s.replace(/&/, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</, '&lt;')
        .replace(/>/, '&gt;')
    ;
}
