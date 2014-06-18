var through = require('through2');
var duplexer = require('duplexer2');
var Readable = require('readable-stream').Readable;
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var parseTag = require('./parse_tag.js');

module.exports = Interface;
inherits(Interface, EventEmitter);

function Interface (pipeline, match) {
    if (!(this instanceof Interface)) return new Interface(pipeline, first);
    var self = this;
    this._pipeline = pipeline;
    this._match = match;
    match.once('close', function () {
        self._closed = true;
        self.emit('close')
    });
    
    var tag = match._start._parsed;
    this.name = tag.name;
    this.attributes = tag.getAttributes();
    this._setAttr = null;
}

Interface.prototype.getAttribute = function (key, cb) {
    var value = this.attributes[String(key).toLowerCase()];
    if (cb) cb(value);
    return value;
};

Interface.prototype.getAttributes = function (cb) {
    if (cb) cb(this.attributes);
    return this.attributes;
};

Interface.prototype.setAttribute = function (key, value) {
    if (!this._setAttr) this._setAttr = {};
    this._setAttr[key] = value;
};

Interface.prototype.removeAttribute = function (key) {
    if (!this._setAttr) this._setAttr = {};
    this._setAttr[key] = undefined;
};

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
        else if (self._match._last === row) {
            var tag = parseTag(row[1]);
            if (self._match._start._parsed.name === tag.name) {
                this.push(row);
            }
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
        else if (last) {
            var tag = parseTag(row[1]);
            if (self._match._start._parsed.name === tag.name) {
                r.push(row);
            }
        }
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

Interface.prototype.createWriteStream = function (opts) {
    var self = this;
    var stream = this.createStream(opts);
    var input = through.obj();
    var output = through.obj();
    stream.pipe(output, { end: false });
    
    this._pipeline.push(duplexer(output, input));
    return input;
};
