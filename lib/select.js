var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable;
var Duplex = require('readable-stream').Duplex;

var duplexer = require('duplexer2');
var through = require('through2');

module.exports = Select;
inherits(Select, EventEmitter);

function Select (sel, pull) {
    if (!(this instanceof Select)) return new Select(sel);
    EventEmitter.call(this);
    this._select = sel;
    this.reset();
    this._pull = pull;
}

Select.prototype.reset = function () {
    this.input = through.obj();
    this.output = through.obj();
    this.matching = null;
};

Select.prototype._exec = function (current, row) {
    if (this.matching) {
        this.input.write(row);
    }
    if (row[0] === 'close' && this.matching === current) {
        this.matching = false;
        this.emit('unmatch');
        this.reset();
    }
    if (row[0] === 'open') {
        var t = this._select(current);
        if (t) {
            this.matching = current.parent;
            this.emit('match');
        }
        return t;
    }
};

Select.prototype.createStream = function (sel) {
    var self = this;
    var w = through.obj();
    var r = new Readable({ objectMode: true });
    r._read = function () {
        if (self.matching) self._pull()
    };
    
    var s = duplexer(w, r);
    
    this.input.pipe(through.obj(function (row, enc, next) {
        r.push(row);
        next();
    }));
    w.pipe(this.output);
    return s;
};

Select.prototype.createReadStream = function (sel) {
    var r = new Readable({ objectMode: true });
    r._read = function () {};
    this.input.pipe(through.obj(function (row, enc, next) {
        r.push(row);
        next();
    }));
    return r;
};

Select.prototype.createWriteStream = function (sel) {
    var self = this;
    this.input.unpipe(this.output);
    var w = new Writable({ objectMode: true });
    w._write = function (buf, enc, next) {
        self.output.write(buf);
        next();
    };
    w.once('finish', function () {
        self.output.end();
    });
    return w;
};
