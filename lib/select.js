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
    this._options = {};
    this.removeAllListeners('close');
};

Select.prototype._exec = function (current, row, p, created) {
    if (row[0] === 'close' && this.matching
    && this.matching.parent === current) {
        if (p.name === this.matching.tag) {
            this._last = row;
            this.input.write(row);
        }
        this.matching = false;
        this.input.end();
        this.emit('close');
    }
    else if (this.matching) {
        this.input.write(row);
    }
    
    if (row[0] === 'open') {
        var t = this._select(current);
        if (t && this.matching) {
            if (!created) this._fork(current, row, p);
        }
        else if (t) {
            this.matching = current;
            this._first = row;
            this.input.write(row);
            this.emit('match');
            if (current.selfClosing) {
                this.matching = false;
                this.input.end();
                this.emit('close');
            }
        }
        return t;
    }
};

Select.prototype._fork = function (current, row, p) {
    var sub = new Select(this._select, function () {});
    this.emit('fork', sub);
    sub._exec(current, row, p);
};

Select.prototype.createStream = function (opts) {
    var self = this;
    if (!opts) opts = {};
    
    var w = through.obj();
    var r = new Readable({ objectMode: true });
    r._read = function () {
        if (self.matching) self._pull();
    };
    
    var s = duplexer(w, r);
    this.input.pipe(through.obj(
        function (row, enc, next) {
            if (opts.inner && self._first === row) {
                w.push(row);
            }
            else if (opts.inner && self._last === row) {
                // ...
            }
            else r.push(row);
            
            next();
        },
        function () { r.push(null) }
    ));
    w.pipe(this.output);
    w.on('finish', function () {
        if (opts.inner) {
            self.output.write(self._last);
        }
        self.output.end();
        self.reset();
    });
    return s;
};

Select.prototype.createReadStream = function (opts) {
    var self = this;
    if (!opts) opts = {};
    
    var r = new Readable({ objectMode: true });
    var s = this.createStream();
    r._read = function () {};
    s.pipe(through.obj(
        function (row, enc, next) {
            if (!opts.inner || (self._first !== row && self._last !== row)) {
                r.push(row);
            }
            this.push(row);
            next();
        },
        function () {
            r.push(null);
            this.push(null)
        }
    )).pipe(s);
    return r;
};

Select.prototype.createWriteStream = function () {
    var self = this;
    var s = this.createStream();
    s.on('data', function () {});
    
    var w = new Writable({ objectMode: true });
    w._write = function (row, enc, next) {
        s.write(row);
        next();
    };
    w.once('finish', function () { s.end() });
    return w;
};
