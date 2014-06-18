var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');
var Readable = require('readable-stream').Readable;

module.exports = Match;
inherits(Match, Splicer);

function Match (start, fn) {
    if (!(this instanceof Match)) return new Match;
    
    var streams = [ this._pre(), [], this._post() ];
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
            self._next = next;
            this.push(null);
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

Match.prototype._post = function () {
    var self = this;
    var first = true;
    return through.obj(write, end);
    
    function write (row, enc, next) {
        this.push(row);
        next();
    }
    
    function end () {
        self.emit('close');
        self._next();
    }
};

Match.prototype.finished = function (tree) {
    if (this._start.selfClosing) return true;
    return tree === this._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this.get(1), this._first);
};
