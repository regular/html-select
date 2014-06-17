var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');
var Readable = require('readable-stream').Readable;

module.exports = Match;
inherits(Match, Splicer);

function Match (start, fn) {
    if (!(this instanceof Match)) return new Match;
    
    var streams = [ this._pre(), [] ];
    this._start = start;
    this._fn = fn;
    
    Splicer.call(this, streams, { objectMode: true });
}

Match.prototype._pre = function () {
    var self = this;
    var first = true;
    return through.obj(function (row, enc, next) {
        if (first) {
            self._fn(self.createInterface());
        }
        first = false;
        
        this.push(row);
        next();
    });
};

Match.prototype.finished = function (tree) {
    return tree === this._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this.get(1), this._first);
};
