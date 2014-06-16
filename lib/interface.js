var through = require('through2');
var duplexer = require('duplexer2');
var Readable = require('readable-stream').Readable;

module.exports = Interface;

function Interface (pipeline) {
    if (!(this instanceof Interface)) return new Interface(pipeline, first);
    this._pipeline = pipeline;
}

Interface.prototype.createStream = function () {
    var self = this;
    var input = through.obj(function (row, enc, next) {
        this.push(row);
        next();
    });
    var output = through.obj();
    this._pipeline.push(duplexer(output, input));
    return duplexer(input, output);
};

Interface.prototype.createReadStream = function () {
    var self = this;
    var input = through.obj();
    
    var stream = through.obj(write, end);
    this._pipeline.push(stream);
    
    var r = new Readable({ objectMode: true });
    r._read = function () {};
    
    return r;
    
    function write (row, enc, next) {
        r.push(row);
        this.push(row);
        next();
    }
    function end () {
        r.push(null);
    }
};

Interface.prototype.createWriteStream = function () {
    var self = this;
    var input = through.obj();
    var output = through.obj();
    this.match.push(duplexer(output, input));
    return input;
};
