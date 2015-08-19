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

var opts = {
  events: ['response']
};

streamForward(request('http://yahoo.com'), opts)
  .pipe(process.stdout)
  .on('response', function (response) {
    // `response` from the request stream.
  });
```

**Note: don't neglect proper event handling on the individual parts of your stream.**

This is just a convenience when you have to manually listen and re-emit events across a middleman/spy pipe. Consider the following example:

```js
var fs = require('fs');

function getRequestStream(reqOpts) {
  var opts = {
    events: ['complete']
  };

  return streamForward(request(reqOpts), opts)
    .pipe(fs.createWriteStream('./request-cache'));
}

getRequestStream('http://yahoo.com')
  .on('complete', function () {
    // Without `stream-forward`, this couldn't emit.
  });
```

## stream = streamForward(stream, [options]);


### stream

Type: `Stream`

The source stream to spy on. This is returned from the function to allow chaining.


### options

*Optional.* Configuration options.


#### options.continuous

Type: `Boolean`
<br>Default: `false`

If true, when a new stream is attached to `stream`, it will receive the events emitted by the original.

##### Disabled (default)
```js
var sourceStream = request('http://yahoo.com');
var through = require('through2');

streamForward(sourceStream)
  .pipe(through())
  .on('complete', function () {
    // Called.
  })
  .pipe(through())
  .on('complete', function () {
    // Not called.
  });
```

##### Enabled
```js
var sourceStream = request('http://yahoo.com');
var through = require('through2');

streamForward(sourceStream, { continuous: true })
  .pipe(through())
  .on('complete', function () {
    // Called.
  })
  .pipe(through())
  .on('complete', function () {
    // Called.
  });
```


#### options.events

Type: `Array`

Event names to re-emit on attached streams.
