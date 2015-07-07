# stream-forward

> Forward events to the next stream in the pipeline.

## Use

```sh
$ npm install --save stream-forward
```
```js
var streamForward = require('stream-forward');
```

## Example

```js
var streamForward = require('stream-forward');
var request = require('request');

streamForward(request('http://yahoo.com'), 'response')
  .pipe(process.stdout)
  .on('response', function (response) {
    // `response` from the request stream.
  });
```

*Note: don't neglect proper event handling on the individual parts of your stream. This is just a convenience when you have to manually listen and re-emit events across a pipe.*

## streamForward(stream, eventNames)

### stream

The source stream to spy on.

### eventNames

Type: `String`, `Array`

Event names to watch and re-emit on attached streams.
