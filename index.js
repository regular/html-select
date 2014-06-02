var through = require('through2');
var inherits = require('inherits');
var Duplex = require('readable-stream').Duplex;
var cssauron = require('cssauron');

var Select = require('./lib/select.js');
var parseTag = require('./lib/parse_tag.js');
var selfClosing = require('./lib/self_closing.js');

module.exports = Plex;
inherits(Plex, Duplex);

function Plex (sel, cb) {
    if (!(this instanceof Plex)) return new Plex(sel, cb);
    Duplex.call(this, { objectMode: true });
    this._selectors = [];
    this._matching = 0;
    this._pullQueue = [];
    this._after = [];
    this._prev = [];
    
    this._root = {};
    this._current = this._root;
    
    this._lang = cssauron({
        tag: function (node) { return getTag(node) },
        class: function (node) { return getAttr(node, 'class') },
        id: function (node) { return getAttr(node, 'id') },
        parent: 'parent',
        children: 'children',
        attr: getAttr
    });
    
    this.on('finish', function () {
        this._finished = true;
        this._advance();
    });
    
    if (sel && cb) this.select(sel, cb);
}

function getTag (node) {
    if (node.tag) return node.tag;
    if (!node.row) return undefined;
    if (!node._parsed) {
        var p = parseTag(node.row[1]);
        node._parsed = p;
        node.tag = p.name;
    }
    return node.tag;
}
    
function getAttr (node, key) {
    if (node.attributes && !key) return node.attributes;
    else if (node.attributes) return node.attributes[key];
    if (!node._parsed) {
        if (!node.row) return undefined;
        var p = parseTag(node.row[1]);
        node._parsed = p;
        node.tag = p.tag;
    }
    node.attributes = node._parsed.getAttributes();
    if (!key) return node.attributes;
    else return node.attributes[key];
}

Plex.prototype.select = function (sel, cb) {
    var self = this;
    var pull = function () { self._advance() };
    var s = new Select(this._lang(sel), pull);
    onfork(s);
    
    function onfork (s) {
        self._selectors.push(s);
        s.on('match', function () {
            self._matching ++;
            if (cb) cb(s);
            
            s.output.pipe(through.obj(function (row, enc, next) {
                var p = self._prev.indexOf(row) < 0;
                self._prev.push(row);
                if (p && !self._prevClear) {
                    self._after.push(function () {
                        self._prev = [];
                        self._prevClear = false;
                    });
                    self._prevClear = true;
                }
                if (p) self.push(row);
                next();
            }));
            s.output.on('end', function () {
                self._matching --;
                process.nextTick(function () {
                    if (self._finished && self._matching === 0) {
                        self.emit('_done');
                    }
                    if (!self._matching) self._advance();
                });
            });
            
            if (s._streams === 0) s.createReadStream();
        });
        s.on('fork', function (sub) {
            sub.once('close', function () {
                self._after.push(function () {
                    var ix = self._selectors.indexOf(sub);
                    if (ix >= 0) self._selectors.splice(ix, 1);
                });
            });
            onfork(sub);
        });
    }
    return this;
};

Plex.prototype._pull = function (cb) {
    var buf = this._buffer;
    var next = this._next;
    if (buf) {
        this._buffer = null;
        this._next = null;
        cb(buf);
        next();
    }
    else if (this._finished && this._matching === 0) {
        cb(null);
    }
    else if (this._finished && !this._ondone) {
        this._ondone = function () { cb(null) };
        this.once('_done', this._ondone);
    }
    else if (!this._ondone) {
        this._pullQueue.push(cb);
    }
};

Plex.prototype._read = function (n) {
    if (this._matching === 0) this._advance();
};

Plex.prototype._advance = function () {
    var self = this;
    this._pull(function (row) {
        if (row === null) {
            for (var i = 0, l = self._selectors.length; i < l; i++) {
                var s = self._selectors[i];
                if (s.input) s.input.end();
            }
            return self.push(null);
        }
        
        var p = self._updateTree(row);
        var created = false;
        for (var i = 0, l = self._selectors.length; i < l; i++) {
            var m = self._selectors[i]._exec(self._current, row, p, created);
            created = m || created;
        }
        while (self._after.length) {
            self._after.shift()();
        }
        
        if (self._current.selfClosing) {
            self._current = self._current.parent;
        }
        if (self._matching === 0) self.push(row);
    });
};

Plex.prototype._updateTree = function (row) {
    if (row[0] === 'open') {
        var node = { parent: this._current, row: row };
        node.selfClosing = node.parent && selfClosing(getTag(node));
        if (!this._current.children) this._current.children = [ node ]
        else this._current.children.push(node);
        this._current = node;
    }
    else if (row[0] === 'close') {
        if (this._current.parent) this._current = this._current.parent;
        return parseTag(row[1]);
    }
};

Plex.prototype._write = function (buf, enc, next) {
    if (this._pullQueue.length) {
        this._pullQueue.shift()(buf);
        next();
    }
    else {
        this._buffer = buf;
        this._next = next;
    }
};

Plex.prototype._err = function (msg) {
    this.emit('error', new Error(msg));
};
