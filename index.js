var inherits = require('inherits');
var Writable = require('readable-stream').Writable;
var EventEmitter = require('events').EventEmitter;
var copy = require('shallow-copy');

var parseTag = require('./lib/parse_tag.js');
var parseSelector = require('./lib/selector.js');
var match = require('./lib/match.js');
var Tag = require('./lib/tag.js');

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
    this.streams = [];
}

Selector.prototype._write = function (row, enc, next) {
    var type = row[0], buf = row[1];
    if (typeof buf === 'string') buf = Buffer(buf);
    if (type === 'open') {
        var tag = parseTag(buf);
        this._push(tag);
        
        if (special.hasOwnProperty(tag.name)) {
            this._pop();
        }
    }
    for (var i = 0; i < this.streams.length; i++) {
        this.streams[i].push(buf);
    }
    if (type === 'close') {
        var tag = parseTag(buf);
        this._pop();
    }
    next();
};

Selector.prototype._push = function (tag) {
    var self = this;
    var row = { tag: tag, matches: [], streams: [] };
    
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        var sel = this.selector[m.index];
        if (match(sel, tag)) {
            if (++ m.index === this.selector.length) {
                m.index --;
                var t = this._fromTag(tag);
                t.on('stream', function (s) {
                    row.streams.push(s);
                    self.streams.push(s);
                });
                this.cb(t);
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
            var t = this._fromTag(tag);
            t.on('stream', function (s) {
                row.streams.push(s);
                self.streams.push(s);
            });
            this.cb(t);
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
    for (var i = 0; i < s.streams.length; i++) {
        s.streams[i].push(null);
        var ix = this.streams.indexOf(s.streams[i]);
        if (ix >= 0) this.streams.splice(ix, 1);
    }
};

Selector.prototype._fromTag = function (tag) {
    return new Tag(tag);
};
