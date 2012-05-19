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
		'change .waveFormSelector input[name=\'waveForm\']' : 'switchWaveForm',
		"mouseup .sustainSlider input" : "slideSustain"
	},

	switchWaveForm: function() {
		var wave = $('.instrument .waveFormSelector input[name=\'waveForm\']:checked').val();
		instrumentView.publish('instrumentViewSwitchWaveForm', wave);
	},

	slideSustain: function(e) {
		var sustain = $(this.el).find(".sustainSlider input").val() / 100;
		instrumentView.publish('instrumentViewSustain', sustain);
	}

});

/**
 *  Module initialization method
 */
instrumentView.initialize = function() {
	view = new InstrumentView();
};

})(jasmed.module('instrumentView'));
