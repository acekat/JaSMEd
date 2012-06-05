(function(playerView) {

/**
 *  Global variables
 */
var view;

/*
1 à 10... avec slide
si on dépasse -> couleur rouge.
*/


/**
 *  Associated View to players Module.
 *  @type {Backbone.View}
 */
var PlayerView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: '.player',

	/** @constructs */
	initialize: function() {
	},

	events: {
		'click .playPause' : 'playPause',
		'click .stop' : 'stop',
		'change .tempo input[name=tempoText]' : 'changeTempoText',
		'change .tempo input[name=tempoSlide]' : 'changeTempoSlide'
	},
	
	changeTempoText: function() {
		var tempoEl = this.$el.find('.tempo');
		var val = tempoEl.find('input[name=tempoText]').val();
		var warn = tempoEl.find('.flash.warn');
		
		warn.hide();
		tempoEl.removeClass('verySlow veryFast');
		
		//check if a number..., -> otherwise warn the x out of him
		// val = parseFloat(val, 10);
		// if (typeof val == 'string') {
		// 	console.log('that ain\'t no number..');
		// 	return;
		// }
				
		// if (val <= 0) {
		// 	warn.show();
		// 	return;
		// }	else if (val < 1)
		// 	tempoEl.addClass('verySlow');
		// else if (val > 10)
		// 	tempoEl.addClass('veryFast');
		
		if (isNaN(val)) {
			warn.filter(".notANumber").show();
			return;
		}

		val = parseFloat(val);		

		if (val <= 0) {
			warn.filter(".notPositive").show();
			return;
		} else if (val < 1)
			tempoEl.addClass('verySlow');
		else if (val > 10)
			tempoEl.addClass('veryFast');

		this.updateTempoSlide(val);
		
		playerView.publish('playerViewTempo', val);
		//console.log('tempoText', val);
	},
	
	changeTempoSlide: function() {
		var tempoEl = this.$el.find('.tempo');
		var val = tempoEl.find('input[name=tempoSlide]').val();
		
		val = parseFloat(val).toFixed(1);
		this.updateTempoText(val);
		tempoEl.removeClass('verySlow veryFast');
		
		playerView.publish('playerViewTempo', val);
		//console.log('tempoSlide', val);
	},
	
	updateTempoSlide: function(val) {
		this.$el.find('.tempo input[name=tempoSlide]').val(val);
	},
	
	updateTempoText: function(val) {
		this.$el.find('.tempo input[name=tempoText]').val(val);
	},
	
	playPause: function(ev) {
		var button = $(ev.target);
		var isPlaying = button.hasClass('playing');
		
		if (isPlaying) {
			playerView.publish('playerViewPause');
			button.removeClass('playing');
			button.html('play');
		} else {
			playerView.publish('playerViewPlay')
			button.addClass('playing');;
			button.html('pause');
		}	
	},

	stop: function() {
		var button = this.$el.find('.playPause');
		
		playerView.publish('playerViewStop');
		button.removeClass('playing');
		button.html('play');
	},
});


/**
 *  SUBSCRIBES
 */
playerView.subscribe('playerStop', function() {
	view.stop();
});


/**
 *  Module initialization method
 */
playerView.initialize = function() {
	view = new PlayerView();
};

})(jasmed.module('playerView'));
