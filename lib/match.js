var parseTag = require('./tag.js');

module.exports = function (sel, tag) {
    if (!sel) return false;
    var name = tag.name;
    
    if (sel.name !== null && sel.name !== '*' && name !== sel.name) {
        return false;
    }
    var pendingCount = 0;
    var p = {
        class: sel.class.length && sel.class.slice(),
        id: sel.id,
        pseudo: sel.pseudo,
        exists: sel.attribute.exists,
        equals: sel.attribute.equals,
        contains: sel.attribute.contains,
        begins: sel.attribute.begins,
        prefixed: sel.attribute.prefixed,
        suffixed: sel.attribute.suffixed,
        containsAnywhere: sel.attribute.containsAnywhere
    };
    var pendingCount = Boolean(p.class) + Boolean(p.id)
        + Boolean(p.pseudo) + Boolean(p.exists) + Boolean(p.equals)
        + Boolean(p.contains) + Boolean(p.begins)
        + Boolean(p.prefixed) + Boolean(p.suffixed) + Boolean(p.containsAnywhere)
        ;
    if (pendingCount === 0) return true;
    
    var attributes = tag.getAttributes();
    if (p.class && attributes.class) {
        var clist = p.class;
        var classes = attributes.class.split(/\s+/);
        for (var i = 0; i < classes.length; i++) {
            var ix = clist.indexOf(classes[i]);
            if (ix >= 0) {
                clist.splice(ix, 1);
                if (clist.length === 0) {
                    if (satisfied('class')) return true;
                }
            }
        }
    }

    if (p.id && p.id === attributes.id) {
        if (satisfied('id')) return true;
    }
    if (p.exists && attributes[p.exists.toLowerCase()] !== undefined) {
        if (satisfied('exists')) return true;
    }
    
    var x;
    if (p.equals && (x = attributes[p.equals[0]])) {
        if (x === p.equals[1]) {
            if (satisfied('equals')) return true;
        }
    }
    if (p.contains && (x = attributes[p.contains[0]])) {
        if (x.split(/\s+/).indexOf(p.contains[1]) >= 0) {
            if (satisfied('contains')) return true;
        }
    }
    if (p.begins && (x = attributes[p.begins[0]])) {
        if (x.split('-')[0] === p.begins[1]) {
            if (satisfied('begins')) return true;
        }
    }
    if (p.prefixed && (x = attributes[p.prefixed[0]])) {
        if (x.slice(0, p.prefixed[1].length) === p.prefixed[1]) {
            if (satisfied('prefixed')) return true;
        }
    }
    if (p.suffixed && (x = attributes[p.suffixed[0]])) {
        if (x.indexOf(p.suffixed[1], x.length - p.suffixed[1].length) !== -1) {
            if (satisfied('suffixed')) return true;
        }
    }
    if (p.containsAnywhere && (x = attributes[p.containsAnywhere[0]])) {
        if (x.indexOf(p.containsAnywhere[1]) !== -1) {
            if (satisfied('containsAnywhere')) return true;
        }
    }
    
    return false;
    
    function satisfied (name) {
        if (!p[name]) return false;
        p[name] = null;
        if (--pendingCount === 0) return true;
    }
};
