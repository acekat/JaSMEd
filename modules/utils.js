var crypto = require('crypto');

/* blatant copy of the parseSignedCookie fn from connect.utils */

/**
 * Sign the given `val` with `secret`.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 * @api private
 */

function sign(val, secret) {
	return val + '.' + crypto
		.createHmac('sha256', secret)
		.update(val)
		.digest('base64')
		.replace(/=+$/, '');
};

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 * @api private
*/

function unsign(val, secret) {
	var str = val.slice(0, val.lastIndexOf('.'));
	return sign(str, secret) == val
		? str
		: false;
};

/**
 * Parse JSON cookie string
 *
 * @param {String} str
 * @return {Object} Parsed object or null if not json cookie
 * @api private
 */

function parseJSONCookie(str) {
  if (0 == str.indexOf('j:')) {
    try {
      return JSON.parse(str.slice(2));
    } catch (err) {
      // no op
    }
  }
}

/**
 * Parse signed cookies, returning an object
 * containing the decoded key/value pairs,
 * while removing the signed key from `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function parseSignedCookies(obj, secret) {
	var ret = {};
	Object.keys(obj).forEach(function(key) {
		var val = obj[key];
		if (0 == val.indexOf('s:')) {
			val = unsign(val.slice(2), secret);
			if (val) {
				ret[key] = val;
				delete obj[key];
			}
		}
	});
	return ret;
};

module.exports = {
	parseJSONCookie: parseJSONCookie,
	parseSignedCookies: parseSignedCookies
}