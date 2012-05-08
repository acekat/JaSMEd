(function(utils){

/**
 * DEPENDENCIES 
 */
var editor = jasmed.module("editor");


/**
 * Return the frequency associated with a MIDI pitch.
 * @param {number} pitch
 * @returns {number} The frequency in Hertz.
 */
utils.midiToHertz = function(pitch) {
    return 440*Math.pow(2, (pitch-69)/12);
};

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

utils.inherits = function(parent, props) {
    return _.extend(Object.create(parent), props);
};


/**
 *  Associated View to utils Module.
 *  @type {Backbone.View}
 */
var UtilsView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: ".utils",

	/** @constructs */
	initialize: function() {
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"click .add-bloc" : "newBloc",
		"click .zoom-in" : "zoomIn",
		"click .zoom-out" : "zoomOut"
	},

	newBloc: function() {
		editor.editorView.newBloc();
	},

	zoomIn: function() {
		editor.editorView.zoom(true);
	},

	zoomOut: function() {
		editor.editorView.zoom(false);
	}

});

/**
 *  Module initialization method
 */
utils.initialize = function() {
	utils.utilsView = new UtilsView();
};

})(jasmed.module('utils'));
