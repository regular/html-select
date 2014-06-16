var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');
var Readable = require('readable-stream').Readable;

module.exports = Match;
inherits(Match, Splicer);

function Match (start, first) {
    if (!(this instanceof Match)) return new Match;
    
    var streams = [ this._pre(), [] ];
    this._start = start;
    this._first = first;
    
    Splicer.call(this, streams, { objectMode: true });
}

Match.prototype._pre = function () {
    var self = this;
    return through.obj(function (row, enc, next) {
        if (row[0] === 'BEGIN' && row[1] === self) {
            self._active = true;
            row[2].fn(self.createInterface());
            next();
        }
        else if (!self._active) {
            this.push(row);
            next();
        }
        else if (row[0] === 'END' && row[1] === self) {
            this.push(null);
        }
        else {
            this.push(row);
            next();
        }
    }, function () {});
};

Match.prototype.finished = function (tree) {
    return tree === this._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this.get(1), this._first);
};
