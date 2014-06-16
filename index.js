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
                    var m = self._createMatch(tree);
                    this.push([ 'BEGIN', m, s ]);
                }
            }
        }
        
        this.push(row);
        
        if (row[0] === 'close') {
            for (var i = 0; i < pipeline.length; i++) {
                var s = pipeline.get(i);
                if (s.finished && s.finished(tree)) {
                    s.once('end', next);
                    this.push([ 'END', s ]);
                    return;
                }
            }
        }
        
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

Plex.prototype._createMatch = function (tree) {
    var m = new Match(tree);
    var pipeline = this.get(1);
    var offset = pipeline._streams.length % 2;
    pipeline.splice(offset, 0, m, through.obj(write, end));
    return m;
    
    function write (buf, enc, next) {
        this.push(buf);
        next();
    }
    
    function end () {
        var ix = pipeline.indexOf(m);
        if (ix >= 0) pipeline.splice(ix, 2);
    }
};
