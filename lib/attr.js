module.exports = function (buf) {
    var i = 1, name;
    for (var i = 1; i < buf.length; i++) {
        var c = String.fromCharCode(buf[i]);
        if (/[\s>]/.test(c)) {
            name = buf.slice(1, i).toString('utf8');
            break;
        }
    }
    return {
        name: name,
        getAttributes: function () { return parse(buf, i) }
    };
}

function parse (buf, i) {
    var attr = {};
    var s = buf.slice(1, -1).toString('utf8');
    var parts = s.match(/[^\s=]+\s*=\s*("[^"]+"|'[^']+'|\S+)|[^\s=]+/g);
    var key, value;
    
    for (var j = 0; j < parts.length; j++) {
        var kv = parts[j].split('=');
        key = kv[0];
        if (kv.length > 1) {
            value = kv.slice(1).join('=');
            if (/^"/.test(value)) {
                value = value.replace(/^"/, '').replace(/"$/, '');
            }
            else if (/^'/.test(value)) {
                value = value.replace(/^'/, '').replace(/'$/, '');
            }
        }
        else value = true;
        attr[key] = value;
    }
    return attr;
}
