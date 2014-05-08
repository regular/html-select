# html-select

match a tokenized html stream with css selectors

[![build status](https://secure.travis-ci.org/substack/html-select.png)](http://travis-ci.org/substack/html-select)

# example

``` js
var select = require('html-select');
var tokenize = require('html-tokenize');
var fs = require('fs');

fs.createReadStream(__dirname + '/page.html')
    .pipe(tokenize())
    .pipe(select('.content span', function (e) {
        console.log('matched:', e);
    }))
;
```

with this html input:

```
<html>
  <body>
    <h1>whoa</h1>
    <div class="content">
      <span class="greeting">beep boop</span>
      <span class="name">robot</div>
    </div>
  </body>
</html>
```

produces this output:

```
matched: { name: 'span', attributes: { class: 'greeting' } }
matched: { name: 'span', attributes: { class: 'name' } }
```

# methods

``` js
var select = require('html-select')
```

## var w = select(selector, cb)

Return a writable stream `w` that expects an object stream of
[html-tokenize](https://npmjs.org/package/html-tokenize) records as input.

`'match'` events are fired for every tag that matches the css `selector`.
`cb(tag)` sets up a listener for `'match'` events when provided.

`tag` looks like:

``` js
{ name: 'input', attributes: { type: 'text', 'name': 'user', value: 'beep' } }
```

The records are of the form:

```
$ echo -e '<html><body><h1>beep boop</h1></body></html>' | html-tokenize 
["open","<html>"]
["open","<body>"]
["open","<h1>"]
["text","beep boop"]
["close","</h1>"]
["close","</body>"]
["close","</html>"]
["text","\n"]
```

except the second item in each record will be a Buffer if you get the results
from [html-tokenize](https://npmjs.org/package/html-tokenize) directly.

## tag.createReadStream(opts)

Additionally to `tag.name` and `tag.attributes`, you can create a readable
stream with all the contents nested under `tag`.

When `opts.outer` is `true`, the outerHTML content of the currently selected tag
is included. For example, taking the selector and `opts` from `process.argv`:

``` js
var select = require('html-select');
var tokenize = require('html-tokenize');
var fs = require('fs');
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), { boolean: [ 'outer' ] });
var selector = argv._.join(' ');

process.stdin.pipe(tokenize())
    .pipe(select(selector, function (e) {
        e.createReadStream(argv).pipe(process.stdout);
    }))
;
```

Running this program normally gives:

```
$ node read.js .content < page.html

      <span class="greeting">beep boop</span>
      <span class="name">robot</div>
    
```

but running the program with `opts.outer` as `true` produces:

```
$ node read.js .content --outer < page.html
<div class="content">
      <span class="greeting">beep boop</span>
      <span class="name">robot</div>
    </div>
```

# events

## w.on('match', function (tag) {})

When the selector matches, this event fires with the `tag`.

## tag.on('close', function () {})

This event fires when a tag is closed and after any readable streams have ended.

# usage

```
usage: html-select SELECTOR

  Given a newline-separated json stream of html tokenize output on stdin,
  print matching tags as newline-separated json on stdout.

```

# todo

* `E > F`
* `E + F`

# install

With [npm](https://npmjs.org) do:

```
npm install html-select
```

to get the library or

```
npm install -g html-select
```

to get the command-line program.

# license

MIT
