var inherits = require('inherits');
var Writable = require('readable-stream').Writable;
var parseTag = require('./lib/tag.js');
var parseSelector = require('./lib/selector.js');
var match = require('./lib/match.js');

var special = (function () {
    var tags = [
        'area', 'base', 'basefont', 'br', 'col', 'hr', 'input',
        'img', 'link', 'meta'
    ];
    var special = {};
    for (var i = 0; i < tags.length; i++) {
        special[tags[i]] = true;
    }
    return special;
})();

inherits(Selector, Writable);
module.exports = Selector;

function Selector (sel, cb) {
    if (!(this instanceof Selector)) return new Selector(sel, cb);
    Writable.call(this, { objectMode: true });
    this.cb = cb;
    this.selector = parseSelector(sel);
    this.stack = [];
    this.matches = [];
}

Selector.prototype._write = function (row, enc, next) {
    var type = row[0], buf = row[1];
    if (type === 'open') {
        var tag = parseTag(buf);
        this._push(tag);
        
        if (special.hasOwnProperty(tag.name)) {
            this._pop();
        }
    }
    else if (type === 'close') {
        var tag = parseTag(buf);
        this._pop();
    }
    next();
};

Selector.prototype.match = function (tag) {
};

Selector.prototype._push = function (tag) {
    var row = { tag: tag, matches: [] };
    
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        var sel = this.selector[m.index];
        if (match(sel, tag)) {
            if (++ m.index === this.selector.length) {
                m.index --;
                this.cb(fromTag(tag));
            }
            else {
                var mcopy = copy(m);
                mcopy.index --;
                this.matches.push(mcopy)
                this.stack[m.startIndex].matches.push(mcopy);
            }
        }
    }
    
    if (match(this.selector[0], tag)) {
        if (this.selector.length === 1) {
            this.cb(fromTag(tag));
        }
        else {
            var m = {
                index: 1,
                startIndex: this.stack.length
            };
            this.matches.push(m);
            row.matches.push(m);
        }
    }
    this.stack.push(row);
};

Selector.prototype._pop = function () {
    var s = this.stack.pop();
    for (var i = 0; i < s.matches.length; i++) {
        var ix = this.matches.indexOf(s.matches[i]);
        if (ix >= 0) this.matches.splice(ix, 1);
    }
};

function fromTag (tag) {
    return { name: tag.name, attributes: tag.getAttributes() };
}
