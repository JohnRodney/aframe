var VRMarkup = require('@mozvr/vr-markup');
var VREvent = require('../vr-event/vr-event');

var registerElement = VRMarkup.registerElement.registerElement;

/**
 * Wraps `querySelector` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match an element.
 * @param {Element=} parent Parent from which to query.
 * @returns {Element} Element matched by selector.
 */
module.exports.$ = function (sel, parent) {
  var el = sel;
  if (sel && typeof sel === 'string') {
    el = (parent || document).querySelector(sel);
  }
  return el;
};

/**
 * Wraps `querySelectorAll` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match elements.
 * @param {Element=} parent Parent from which to query.
 * @returns {Array} Array of elements matched by selector.
 */
module.exports.$$ = function (sel, parent) {
  if (Array.isArray(sel)) { return sel; }
  var els = sel;
  if (sel && typeof sel === 'string') {
    els = (parent || document).querySelectorAll(sel);
  }
  return toArray(els);
};

/**
 * Turns an array-like object into an array.
 *
 * @param {String|Element} obj CSS selector to match elements.
 * @param {Array|NamedNodeMap|NodeList|HTMLCollection} arr An array-like object.
 * @returns {Array} Array of elements matched by selector.
 */
var toArray = module.exports.toArray = function (obj) {
  if (Array.isArray(obj)) { return obj; }
  if (typeof obj === 'object' && typeof obj.length === 'number') {
    return Array.prototype.slice.call(obj);
  }
  return [obj];
};

/**
 * Wraps `Array.prototype.forEach`.
 *
 * @param {Object} arr An array-like object.
 * @returns {Array} A real array.
 */
var forEach = module.exports.forEach = function (arr, fn) {
  return Array.prototype.forEach.call(arr, fn);
};

/**
 * Merges attributes à la `Object.assign`.
 *
 * @param {...Object} els
 *   Array-like object (NodeMap, array, etc.) of
 *   parent elements from which to query.
 * @returns {Array} Array of merged attributes.
 */
module.exports.mergeAttrs = function () {
  var mergedAttrs = {};
  forEach(arguments, function (el) {
    forEach(el.attributes, function (attr) {
      // NOTE: We use `getAttribute` instead of `attr.value` so our wrapper
      // for coordinate objects gets used.
      mergedAttrs[attr.name] = el.getAttribute(attr.name);
    });
  });
  return mergedAttrs;
};

/**
 * Does ES6-style (or mustache-style) string formatting.
 *
 * > format('${0}', ['zzz'])
 * "zzz"
 *
 * > format('${0}{1}', 1, 2)
 * "12"
 *
 * > format('${x}', {x: 1})
 * "1"
 *
 * > format('my favourite color is ${color=blue}', {x: 1})
 * "my favourite color is blue"
 *
 * @returns {String} Formatted string with interpolated variables.
 */
module.exports.format = (function () {
  var regexes = [
    /\$?\{\s*([^}= ]+)(\s*=\s*(.+))?\s*\}/g,
    /\$?%7B\s*([^}= ]+)(\s*=\s*(.+))?\s*%7D/g
  ];
  return function (s, args) {
    if (!s) { throw new Error('Format string is empty!'); }
    if (!args) { return; }
    if (!(args instanceof Array || args instanceof Object)) {
      args = Array.prototype.slice.call(arguments, 1);
    }
    Object.keys(args).forEach(function (key) {
      args[String(key).toLowerCase()] = args[key];
    });
    regexes.forEach(function (re) {
      s = s.replace(re, function (_, name, rhs, defaultVal) {
        var val = args[name.toLowerCase()];

        if (typeof val === 'undefined') {
          return (defaultVal || '').trim().replace(/^["']|["']$/g, '');
        }

        return (val || '').trim().replace(/^["']|["']$/g, '');
      });
    });
    return s;
  };
})();

/**
 * Wraps an element as a new one with a different name.
 *
 * @param {String} newTagName - Name of the new custom element.
 * @param {Element} srcElement - Original custom element to wrap.
 * @param {Object=} [data={}] - Data for the new prototype.
 * @returns {Array} Wrapped custom element.
 */
var wrapElement = module.exports.wrapElement = function (newTagName, srcElement, data) {
  data = data || {};
  return registerElement(newTagName, {
    prototype: Object.create(srcElement.prototype, data)
  });
};

/**
 * Wraps `<vr-event>` for a particular event `type`.
 *
 * @param {String} newTagName - Name of the new custom element.
 * @param {Element} eventName - Name of event type.
 * @param {Object=} [data={}] - Data for the new prototype.
 * @returns {Array} Wrapped custom element.
 */
module.exports.wrapVREventElement = function (newTagName, eventName, data) {
  data = data || {};
  data.type = {
    value: eventName,
    writable: window.debug
  };
  return wrapElement(newTagName, VREvent, data);
};

/**
 * Splits a string into an array based on a delimiter.
 *
 * @param   {string=} [str='']        Source string
 * @param   {string=} [delimiter=' '] Delimiter to use
 * @returns {array}                   Array of delimited strings
 */
module.exports.splitString = function (str, delimiter) {
  if (typeof delimiter === 'undefined') { delimiter = ' '; }
  // First collapse the whitespace (or whatever the delimiter is).
  var regex = new RegExp(delimiter, 'g');
  str = (str || '').replace(regex, delimiter);
  // Then split.
  return str.split(delimiter);
};