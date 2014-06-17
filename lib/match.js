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
    return through.obj(write, end);
    
    function write (row, enc, next) {
        if (first) {
            self._fn(self.createInterface());
        }
        first = false;
        
        if (row[0] === 'END') {
            self.emit('close');
            setImmediate(next);
        }
        else {
            this.push(row);
            next();
        }
    }
    
    function end () {
        //this.push(null);
    }
};

Match.prototype.finished = function (tree) {
    return tree === this._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this.get(1), this._first);
};
