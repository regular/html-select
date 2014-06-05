var inherits = require('inherits');
var Transform = require('readable-stream').Transform;
var through = require('through2');

module.exports = Match;
inherits(Match, Transform);

function Match (start) {
    if (!(this instanceof Match)) return new Match(start);
    Transform.call(this, { objectMode: true });
    this._start = start;
}

Match.prototype._transform = function (row, enc, next) {
    row[1] = String(row[1]).toUpperCase();
    this.push(row);
    next();
};

Match.prototype._check = function (node) {
    if (node === this._start.parent) {
        this.emit('close');
        this.end();
    }
};
