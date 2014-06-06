var through = require('through2');
var duplexer = require('duplexer2');
var Readable = require('readable-stream').Readable;

module.exports = Interface;

function Interface (match) {
    if (!(this instanceof Interface)) return new Interface(match);
    this.match = match;
}

Interface.prototype.createStream = function () {
    var input = through.obj();
    var output = through.obj();
    this.match.pushStream(duplexer(output, input));
    return duplexer(input, output);
};

Interface.prototype.createReadStream = function () {
    var stream = through.obj(write, end);
    
    var r = new Readable({ objectMode: true });
    r._read = function () {};
    this.match.pushStream(stream);
    
    return r;
    
    function write (row, enc, next) {
        r.push(row);
        this.push(row);
        next();
    }
    function end () {
        r.push(null);
        this.push(null);
    }
};

Interface.prototype.createWriteStream = function () {
    var input = through.obj();
    var output = through.obj();
    this.match.pushStream(duplexer(output, input));
    return input;
};
