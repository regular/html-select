module.exports = function (sel, node) {
    if (!sel) return false;
    if (sel.name !== null && sel.name !== '*' && node.name !== sel.name) {
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
    
    if (p.class && node.attributes.class) {
        var clist = p.class;
        var classes = node.attributes.class.split(/\s+/);
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

    if (p.id && p.id === node.attributes.id) {
        if (satisfied('id')) return true;
    }
    if (p.exists && node.attributes[p.exists.toLowerCase()] !== undefined) {
        if (satisfied('exists')) return true;
    }
    
    var x;
    if (p.equals && (x = node.attributes[p.equals[0].toUpperCase()])) {
        if (x === p.equals[1]) {
            if (satisfied('equals')) return true;
        }
    }
    if (p.contains && (x = node.attributes[p.contains[0].toUpperCase()])) {
        if (x.split(/\s+/).indexOf(p.contains[1]) >= 0) {
            if (satisfied('contains')) return true;
        }
    }
    if (p.begins && (x = node.attributes[p.begins[0].toUpperCase()])) {
        if (x.split('-')[0] === p.begins[1]) {
            if (satisfied('begins')) return true;
        }
    }
    if (p.prefixed && (x = node.attributes[p.prefixed[0].toUpperCase()])) {
        if (x.slice(0, p.prefixed[1].length) === p.prefixed[1]) {
            if (satisfied('prefixed')) return true;
        }
    }
    if (p.suffixed && (x = node.attributes[p.suffixed[0].toUpperCase()])) {
        if (x.indexOf(p.suffixed[1], x.length - p.suffixed[1].length) !== -1) {
            if (satisfied('suffixed')) return true;
        }
    }
    if (p.containsAnywhere && (x = node.attributes[p.containsAnywhere[0].toUpperCase()])) {
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
