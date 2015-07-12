'use strict';

var onEverything = require('on-everything');
var toMap = require('array-to-map');
var stub = require('stubs');

/**
 * @param {object=} opts
 * @param {boolean} opts.continuous - Emit on all future pipes, or just
 *                                    the next pipe in line. (Default: false)
 * @param {string[]} opts.events - Names of events to forward.
 * @param {string[]} opts.excludeEvents - Names of events to exclude.
 */
module.exports = function (stream, opts) {
  opts = opts || {};

  var eventNamesToEmit = toMap(opts.events || []);
  var catchAll = Object.keys(eventNamesToEmit).length === 0;

  var eventNamesToExclude = toMap(opts.excludeEvents || []);

  watchPipe(stream);

  function watchPipe(stream) {
    stub(stream, 'pipe', { callthrough: true }, function (newStream) {
      onEverything(stream, function (eventName) {
        var eventIncluded = catchAll || eventNamesToEmit[eventName];
        var eventExcluded = eventNamesToExclude[eventName];

        if (eventIncluded && !eventExcluded) {
          newStream.emit.apply(newStream, arguments);
        }
      });

      if (opts.continuous) {
        watchPipe(newStream);
      }
    });
  }

  return stream;
};
