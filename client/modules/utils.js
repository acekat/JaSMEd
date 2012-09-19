var utils = module.exports;

var A4_FREQ = 440 // frequency of A4 (La3) in hertz
  , A4_MIDI_NUM = 69 // standardized MIDI note number for A4 (La3)
  , NUM_NOTES_IN_OCT = 12; // number of semitones/notes in an octave

/**
 * Return the frequency associated with a MIDI pitch.
 * @param {number} pitch
 * @returns {number} The frequency in Hertz.
 */
utils.midiToHertz = function(pitch) {
  return A4_FREQ * Math.pow(2, (pitch - A4_MIDI_NUM) / NUM_NOTES_IN_OCT);
};

/**
 * Return the divisors of a number.
 * @param {number} n
 * @returns {number[]}
 */
utils.divisors = function(n) {
  var i
    , max = Math.floor(Math.sqrt(n))
    , result = [];
  
  for (i = 2; i <= max; i++)
    if(!(n % i))
      result.push(i, n / i);
      
  return result; // sort ?
};

// 
/**
 * Return the greatest common divisor (gcd) of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
utils.gcd = function(a, b) {
  return b === 0 ? a : utils.gcd(b, a % b);
};

// ppcm
/**
 * Return the least common multiple (lcm) of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
utils.lcm = function(a, b) {
  return a * b / utils.gcd(a, b);
};

utils.inherits = function(parent, props) {
  return _.extend(Object.create(parent), props);
};
