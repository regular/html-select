var through = require('through2');
var inherits = require('inherits');
var Duplex = require('readable-stream').Duplex;
var cssauron = require('cssauron');

var Match = require('./lib/match.js');
var parseTag = require('./lib/parse_tag.js');
var selfClosing = require('./lib/self_closing.js');

module.exports = Plex;
inherits(Plex, Duplex);

function Plex (sel, cb) {
    if (!(this instanceof Plex)) return new Plex(sel, cb);
    Duplex.call(this, { objectMode: true });
    this._selectors = [];
    this._matching = [ through.obj() ];
    this._reading = this._matching.slice();
    
    this._after = [];
    
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
    
function getAttr (node, k) {
    var key = k.toLowerCase();
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
    this._selectors.push({ test: this._lang(sel), fn: cb });
    return this;
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
    }
    return this._current;
};

Plex.prototype._read = function read (n) {
    var self = this;
    var r = this._reading[this._reading.length - 1];
    var row, reads = 0;
    while ((row = r.read()) !== null) {
        this.push(row);
        reads ++;
    }
    if (reads === 0) r.once('readable', function () { read.call(self) });
};

Plex.prototype._write = function (row, enc, next) {
    var self = this;
    var tree = this._updateTree(row);
    
    for (var i = 0, l = this._selectors.length; i < l; i++) {
        var s = this._selectors[i];
//        if (s.test(tree)) this._createMatch();
    }
    
//console.error('WRITE', row);
    this._matching[0].write(row);
    
    while (this._after.length) this._after.shift()();
    
    next();
};

Plex.prototype._createMatch = function () {
    var self = this;
    var m = new Match;
    m.once('finish', function () {
        self._after.push(function () {
            var ix = self._matching.indexOf(m);
            self._matching.splice(ix, 1);
        });
    });
    m.once('end', function () {
        self._after.push(function () {
            var ix = self._reading.indexOf(m);
            self._reading.splice(ix, 1);
        });
    });
    
    self._matching.push(m);
    self._reading.push(m);
};
