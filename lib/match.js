var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');

module.exports = Match;
inherits(Match, Splicer);

function Match (selectors) {
    if (!(this instanceof Match)) return new Match(selectors);
    this._selectors = selectors;
    
    var streams = [ this._pre(), [], this._post() ];
    Splicer.call(this, streams, { objectMode: true });
}

Match.prototype._pre = function () {
    var self = this;
    return through.obj(function (chunk, enc, next) {
        this.push(chunk);
        var tree = chunk[0], row = chunk[1];
        
        if (!self._start) self._start = tree;
        for (var i = 0; i < self._selectors.length; i++) {
            var s = self._selectors[i];
            if (s.test(tree)) {
                s.fn(self._createMatch());
            }
        }
        
        next();
    });
};

Match.prototype._post = function () {
    var self = this;
    return through.obj(function (chunk, enc, next) {
        var tree = chunk[0], row = chunk[1];
        this.push(chunk);
        if (self._start && tree === self._start.parent) {
            self.emit('close');
        }
        next();
    });
};

Match.prototype.createInterface = function () {
    return new Interface(this);
};

Match.prototype._createMatch = function () {
    var self = this;
    var m = new Match(this._selectors);
    var pipeline = this.get(1);
    pipeline.push(m);
    
    m.once('close', function () {
        var ix = pipeline.indexOf(m);
        if (ix >= 0) pipeline.splice(ix, 1);
    });
    return m.createInterface();
};
