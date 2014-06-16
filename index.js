var through = require('through2');
var inherits = require('inherits');
var Splicer = require('stream-splicer');
var Duplexer = require('readable-stream').Duplexer;

var Match = require('./lib/match.js');
var selfClosing = require('./lib/self_closing.js');
var getTag = require('./lib/get_tag.js');
var lang = require('./lib/lang.js');

module.exports = Plex;
inherits(Plex, Splicer);

function Plex (sel, cb) {
    var self = this;
    if (!(this instanceof Plex)) return new Plex(sel, cb);
    
    var streams = [ this._pre(), [] ];
    Splicer.call(this, streams, { objectMode: true });
    
    this._root = {};
    this._current = this._root;
    
    this._selectors = [];
    this._lang = lang();
    
    if (sel && cb) this.select(sel, cb);
}

Plex.prototype._pre = function () {
    var self = this;
    var pipeline;
    
    return through.obj(function (row, enc, next) {
        var tree = self._updateTree(row);
        if (!pipeline) pipeline = self.get(1);
        
        if (row[0] === 'open') {
            for (var i = 0, l = self._selectors.length; i < l; i++) {
                var s = self._selectors[i];
                if (s.test(tree)) {
                    s.fn(self._createMatch());
                }
            }
        }
        
        this.push(row);
        
        if (row[0] === 'close') {
            for (var i = 0; i < pipeline.length; i++) {
                var s = pipeline.get(i);
                if (s.finished && s.finished(tree)) {
                    this.push([ 'END', s ]);
                }
            }
        }
        
        next();
    });
};

Plex.prototype._post = function () {
    return through.obj(function (row, enc, next) {
        this.push(row[1]);
        next();
    });
};
 
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

Plex.prototype._createMatch = function () {
    var m = new Match(this._selectors);
    var pipeline = this.get(1);
    pipeline.unshift(m, through.obj(null, function () {
        var ix = pipeline.indexOf(m);
        if (ix >= 0) pipeline.splice(ix, 2);
    }));
    
    m.once('close', function () {
        var ix = pipeline.indexOf(m);
        if (ix >= 0) pipeline.splice(ix, 1);
    });
    return m.createInterface();
};
