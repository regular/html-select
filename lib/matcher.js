var parseSelector = require('./selector.js');
var match = require('./match.js');

module.exports = function (selector) {
    var sel = parseSelector(selector);
    return function (stack) {
        var matching = [];
        for (var i = 0; i < stack.length; i++) {
            var tag = stack[i];
            for (var j = 0; j < matching.length; j++) {
                var si = matching[j];
                if (match(sel[si], tag)) {
                    if (++ matching[j] >= sel.length) {
                        return tag;
                    }
                }
            }
            if (match(sel[0], tag)) {
                if (sel.length === 1) return tag;
                matching.push(i);
            }
        }
    };
};
