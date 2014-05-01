var inherits = require('inherits');
var Readable = require('readable-stream').Readable;
var EventEmitter = require('events').EventEmitter;

module.exports = Tag;
inherits(Tag, EventEmitter);

function Tag (tag) {
    this.name = tag.name;
    this.attributes = tag.getAttributes();
}

Tag.prototype.createReadStream = function (opts) {
    var r = new Readable;
    r._options = opts || {};
    r._writes = 0;
    r._read = function () {};
    this.emit('stream', r);
    return r;
};
