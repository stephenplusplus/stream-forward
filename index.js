'use strict';

var stub = require('stubs');

module.exports = function (stream, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

  stub(stream, 'pipe', { callthrough: true }, function (newStream) {
    eventNames.forEach(function (eventName) {
      stream.on(eventName, newStream.emit.bind(newStream, eventName));
    });
  });

  return stream;
};
