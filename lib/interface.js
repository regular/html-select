var through = require('through2');
var duplexer = require('duplexer2');
var Readable = require('readable-stream').Readable;

module.exports = Interface;

function Interface (pipeline, match) {
    if (!(this instanceof Interface)) return new Interface(pipeline, first);
    this._pipeline = pipeline;
    this._match = match;
}

Interface.prototype.createStream = function (opts) {
    if (!opts) opts = {};
    var self = this;
    var input = through.obj(iwrite, iend);
    var output = through.obj(owrite);
    var first = true, last = null;
    
    this._pipeline.push(duplexer(output, input));
    return duplexer(input, output);
    
    function owrite (row, enc, next) {
        if (opts.inner && first) {
            input.write(row);
        }
        else if (opts.inner && self._match._last === row) {
            last = row;
        }
        else this.push(row);
        
        first = false;
        next();
    }
    
    function iwrite (row, enc, next) {
        this.push(row);
        next();
    }
    
    function iend () {
        if (last) this.push(last);
        this.push(null);
    }
};

Interface.prototype.createReadStream = function (opts) {
    if (!opts) opts = {};
    var self = this;
    var input = through.obj();
    var first = true;
    
    var stream = through.obj(write, end);
    this._pipeline.push(stream);
    
    var r = new Readable({ objectMode: true });
    r._read = function () {};
    
    return r;
    
    function write (row, enc, next) {
        var last = self._match._last === row;
        
        if (opts.inner && (first || last)) {}
        else r.push(row);
        first = false;
        
        this.push(row);
        next();
    }
    
    function end () {
        r.push(null);
        this.push(null);
    }
};

Interface.prototype.createWriteStream = function () {
    var self = this;
    var input = through.obj();
    var output = through.obj();
    this._pipeline.push(duplexer(output, input));
    return input;
};
