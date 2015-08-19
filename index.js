'use strict';

var arrify = require('arrify');
var stub = require('stubs');

/**
 * @param {object=} opts
 * @param {boolean} opts.continuous - Emit on all future pipes, or just
 *                                    the next pipe in line. (Default: false)
 * @param {string[]} opts.events - Names of events to forward.
 */
module.exports = function (stream, opts) {
  opts = opts || {};
  opts.events = arrify(opts.events);

  watchPipe(stream);

  function watchPipe(stream) {
    stub(stream, 'pipe', { callthrough: true }, function (newStream) {
      opts.events.forEach(function(eventName) {
        stream.on(eventName, newStream.emit.bind(newStream, eventName));
      });

      if (opts.continuous) {
        watchPipe(newStream);
      }
    });
  }

  return stream;
};
