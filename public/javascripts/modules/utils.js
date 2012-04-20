(function(utils){

/**
 * Return the divisors of a number.
 * @param {number} n
 * @returns {number[]}
 */
utils.divisors = function(n) {
    var i, max = Math.floor(Math.sqrt(n)), result = [];
    for(i = 2 ; i <= max ; i++) {
        if(!n%i) {
            result.push(i, n/i);
        }
    }
    return result; // sort ?
};

/**
 * Return the pgcd of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
utils.pgcd = function(a, b) {
    return b === 0 ? a : utils.pgcd(b, a%b);
};

/**
 * Return the ppcm of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
utils.ppcm = function(a, b) {
    return a*b/utils.pgcd(a, b);
};

utils.extend = function(parent, props) {
    return _.extend(Object.create(parent), props);
};

})(jasmed.module('utils'));
