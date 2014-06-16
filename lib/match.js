var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');
var Readable = require('readable-stream').Readable;

module.exports = Match;
inherits(Match, Splicer);

function Match (start) {
    if (!(this instanceof Match)) return new Match;
    
    var streams = [ this._pre(), [] ];
    this._start = start;
    Splicer.call(this, streams, { objectMode: true });
}

Match.prototype._pre = function () {
    var self = this;
    return through.obj(function (row, enc, next) {
        if (row[0] === 'END') {
            this.push(null);
        }
        else this.push(row);
        
        next();
    }, function () {});
};

Match.prototype.finished = function (tree) {
    return tree === this._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this);
};
