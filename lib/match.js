var inherits = require('inherits');
var Duplex = require('readable-stream').Duplex;
var through = require('through2');

module.exports = function () {
    return through();
};

/*
module.exports = Match;
inherits(Match, Duplex);

function Match () {
    if (!(this instanceof Match)) return new Match();
    Duplex.call(this, { objectMode: true });
}
*/
