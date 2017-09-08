var _ = require('lodash');

function flattenAndInsert(data, obj) {
  const flatObj = this.flatten(obj);
  return Object.keys(flatObj).reduce((obj, key) => {
    return Object.assign(obj, { [key]: flatObj[key] });
  }, data);
}

function flatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '.';
  var maxDepth = opts.maxDepth;
  var output = {};

  function step(object, prev, currentDepth) {
    currentDepth = currentDepth ? currentDepth : 1;
    Object.keys(object).forEach((key) => {
      var value = object[key];
      var isarray = opts.safe && Array.isArray(value);
      var type = Object.prototype.toString.call(value);
      var isbuffer = false;
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      );

      var newKey = prev
        ? prev + delimiter + key
        : key;

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1);
      }

      output[newKey] = value;
    });
  }

  step(target);

  return output;
}

function unflatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '.';
  var overwrite = opts.overwrite || false;
  var result = {};

  var isbuffer = false;
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target;
  }

  // safely ensure that the key is
  // an integer.
  function getkey(key) {
    var parsedKey = Number(key);

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1
    ) ? key
      : parsedKey;
  }

  Object.keys(target).forEach((key) => {
    var split = key.split(delimiter);
    var key1 = getkey(split.shift());
    var key2 = getkey(split[0]);
    var recipient = result;

    while (key2 !== undefined) {
      var isobject = (
        _.isObject(recipient[key1]) || _.isArray(recipient[key1])
      );

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return;
      }

      if ((overwrite && !isobject) || (!overwrite && _.isNil(recipient[key1]))) {
        recipient[key1] = (
          typeof key2 === 'number' &&
            !opts.object ? [] : {}
        );
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts);
  });

  return result;
}

module.exports = {
  flattenAndInsert: flattenAndInsert,
  flatten: flatten,
  unflatten: unflatten,
};
