var inherits = require('inherits');
var Duplex = require('readable-stream').Duplex;
var Interface = require('./interface.js');
var through = require('through2');

module.exports = Match;
inherits(Match, Duplex);

function Match (start) {
    if (!(this instanceof Match)) return new Match(start);
    var self = this;
    Duplex.call(this, { objectMode: true });
    this._start = start;
    this._streams = [ through.obj() ];
    
    this.once('finish', function () {
        self._streams[self._streams.length-1].end();
    });
    this._onend = function () {
        self.push(null);
    };
}

Match.prototype.pushStream = function (stream) {
    var prev = this._streams[this._streams.length-1]
    prev.pipe(stream);
    prev.removeListener('end', this._onend);
    stream.once('end', this._onend);
    
    this._streams.push(stream);
    this.emit('_push');
    
};

Match.prototype._read = function (n) {
    var self = this;
    var r = this._streams[this._streams.length-1];
    var row, reads = 0;
    while ((row = r.read()) !== null) {
        this.push(row);
        reads ++;
    }
    if (reads === 0) {
        var onreadable = function () {
            r.removeListener('readable', onreadable);
            self.removeListener('_push', onreadable);
            self._read()
        };
        r.once('readable', onreadable);
        this.once('_push', onreadable);
    }
};

Match.prototype._write = function (row, enc, next) {
    this._streams[0]._write(row, enc, next);
};

Match.prototype._check = function (node) {
    if (node === this._start.parent) {
        this.emit('close');
        this.end();
    }
};

Match.prototype.createInterface = function () {
    return new Interface(this);
};
