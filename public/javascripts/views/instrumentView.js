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
	    $('.instrument. #sustainSlider').({
			min: 0,
			max: 1,
			step: .01,
			value: ratio
		});
	},

	events: {
		'change .waveFormSelector input[name=\'waveForm\']' : 'switchWaveForm'
	},

	switchWaveForm: function() {
		var wave = $('.instrument .waveFormSelector input[name=\'waveForm\']:checked').val();
		instrumentView.publish('instrumentViewSwitchWaveForm', wave);
	}
        
        sustain: function() {
	    var value = $('.instrument sustainSlider').val();
	    instrumentView.publish('instrumentViewSustain', value);
	}
});

/**
 *  Module initialization method
 */
instrumentView.initialize = function() {
	view = new InstrumentView();
};

})(jasmed.module('instrumentView'));
