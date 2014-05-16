var cssauron = require('cssauron');
var css = cssauron({
    tag: function (node) {
        console.log('LOOKUP TAG', node);
    }
});

var sel = css('x');
console.log(sel({ x : 3 }));
