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

  it('forwards events', function (done) {
    var eventsEmitted = 0;
    var opts = {
      events: ['complete', 'response']
    };

    streamForward(request('http://www.google.com/hello'), opts)
      .on('error', done)
      .pipe(through())
      .on('response', function () { eventsEmitted++; })
      .on('complete', function () {
        assert.strictEqual(eventsEmitted, 1);
        done();
      });
  });

  it('forwards one stream down by default', function (done) {
    var opts = {
      events: ['complete', 'response']
    };

    streamForward(request('http://www.google.com/hello'), opts)
      .on('error', done)
      .pipe(through())
      .on('complete', function () {
        done();
      })
      .pipe(through())
      .on('complete', done); // If called, the test blows up.
  });

  it('forwards to all streams', function (done) {
    var opts = {
      continuous: true,
      events: ['complete']
    };
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
