'use strict';

var request = require('request');
var through = require('through2');

var streamForward = require('./index.js');

describe('stream-forward', function () {
  it('works', function (done) {
    streamForward(request('http://www.google.com/hello'), 'complete')
      .on('error', done)
      .pipe(through())
      .on('complete', function () {
        done();
      });
  });
});
