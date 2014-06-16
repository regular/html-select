var inherits = require('inherits');
var Interface = require('./interface.js');
var through = require('through2');
var Splicer = require('stream-splicer');
var Readable = require('readable-stream').Readable;

module.exports = Match;
inherits(Match, Splicer);

function Match (selectors) {
    if (!(this instanceof Match)) return new Match(selectors);
    this._selectors = selectors;
    
    var streams = [ this._pre(), [] ];
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
    });
};

Match.prototype.finished = function (tree) {
    return tree === self._start.parent;
};

Match.prototype.createInterface = function () {
    return new Interface(this);
};
