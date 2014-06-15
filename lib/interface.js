var through = require('through2');
var duplexer = require('duplexer2');
var Readable = require('readable-stream').Readable;

module.exports = Interface;

function Interface (match) {
    if (!(this instanceof Interface)) return new Interface(match);
    this.match = match;
}

Interface.prototype.createStream = function () {
    var self = this;
    var lastTree = null;
    var input = through.obj(function (row, enc, next) {
        stream.push([ lastTree, row ]);
        next();
    });
    var output = through.obj();
    var stream = through.obj(function (chunk, enc, next) {
        lastTree = chunk[0];
        output.push(chunk[1]);
        next();
    });
    this.match.push(stream);
    
    this.match.once('close', function () {
        var ix = self.match.indexOf(stream);
        if (ix >= 0) self.match.splice(ix, 1);
 
        output.push(null);
    });
    
    return duplexer(input, output);
};

Interface.prototype.createReadStream = function () {
    var self = this;
    var stream = through.obj(write, end);
    this.match.push(stream);
    
    var r = new Readable({ objectMode: true });
    r._read = function () {};
    
    return r;
    
    function write (row, enc, next) {
        r.push(row[1]);
        this.push(row);
        next();
    }
    function end () {
        r.push(null);
        var ix = self.match.indexOf(stream);
        if (ix >= 0) self.match.splice(ix, 1);
    }
};

Interface.prototype.createWriteStream = function () {
    var self = this;
    var input = through.obj();
    var output = through.obj(null, function () {
        var ix = self.match.indexOf(dup);
        if (ix >= 0) self.match.splice(ix, 1);
    });
    var dup = duplexer(output, input);
    this.match.push(dup);
    return input;
};
