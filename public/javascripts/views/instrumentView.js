(function(instrumentView) {

/**
 *  Global variables
 */
var view;

/**
 *  Associated View to instrument Module.
 *  @type {Backbone.View}
 */
var InstrumentView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: '.instrument',

	/** @constructs */
	initialize: function() {
	},

	events: {
		'change .waveFormSelector input[name=\'waveForm\']' : 'switchWaveForm'
	},

	switchWaveForm: function() {
		var wave = $('.instrument .waveFormSelector input[name=\'waveForm\']:checked').val();
		instrumentView.publish('instrumentViewSwitchWaveForm', wave);
	}

});

/**
 *  Module initialization method
 */
instrumentView.initialize = function() {
	view = new InstrumentView();
};

})(jasmed.module('instrumentView'));
