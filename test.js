'use strict';

var assert = require('assert');
var request = require('request');
var through = require('through2');

var streamForward = require('./index.js');

describe('stream-forward', function () {
  it('should return the source stream', function () {
    var sourceStream = through();
    var returnedStream = streamForward(sourceStream);

    assert.strictEqual(sourceStream, returnedStream);
  });

  it('does not try to finish a piped stream', function () {
    var streamThatErrors = through();

    streamForward(streamThatErrors)
      .pipe(through(function(chunk, enc, next) {
        // let this back up so that if the source stream emits 'finish', and
        // streamforward tries to re-emit that event on this stream, it will
        // throw.
      }));

    streamThatErrors.write('blah');

    assert.doesNotThrow(function() {
      streamThatErrors.emit('prefinish');
    });
  });

  it('forwards all events by default', function (done) {
    var eventsEmitted = 0;

    streamForward(request('http://www.google.com/hello'))
      .on('error', done)
      .pipe(through())
      .on('response', function () { eventsEmitted++; })
      .on('complete', function () {
        assert.strictEqual(eventsEmitted, 1);
        done();
      });
  });

  it('forwards specific events', function (done) {
    var eventsEmitted = 0;
    var opts = { events: ['complete'] };

    streamForward(request('http://www.google.com/hello'), opts)
      .on('error', done)
      .pipe(through())
      .on('response', function () { eventsEmitted++; })
      .on('complete', function () {
        assert.strictEqual(eventsEmitted, 0);
        done();
      });
  });

  it('should ignore events', function (done) {
    var completeCalled = false;
    var opts = { excludeEvents: ['complete'] };

    streamForward(request('http://www.google.com/hello'), opts)
      .on('error', done)
      .pipe(through())
      .on('complete', function () { completeCalled = true; })
      .on('end', function () {
        assert.strictEqual(completeCalled, false);
        done();
      });
  });

  it('forwards one stream down by default', function (done) {
    streamForward(request('http://www.google.com/hello'))
      .on('error', done)
      .pipe(through())
      .on('complete', function () {
        done();
      })
      .pipe(through())
      .on('complete', done); // If called, the test blows up.
  });

  it('forwards to all streams', function (done) {
    var opts = { continuous: true };
    var firstDoneCalled = false;

    streamForward(request('http://www.google.com/hello'), opts)
      .on('error', done)
      .pipe(through())
      .on('complete', function () { firstDoneCalled = true; })
      .pipe(through())
      .on('complete', function () {
        assert.strictEqual(firstDoneCalled, true);
        done();
      });
  });
});
