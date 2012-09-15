var playerView = {};

/**
 *  DEPENDENCIES
 */
var Backbone = require('Backbone');
var $ = require('jquery');
require('../modules/mediator').installTo(playerView);

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
		'change .tempo input[name=tempoSlide]' : 'changeTempoSlide',
		'change input[name=repeat]' : 'repeat'
	},
	
	changeTempoText: function() {
		var tempoEl = this.$el.find('.tempo');
		var val = tempoEl.find('input[name=tempoText]').val();
		var warn = tempoEl.find('.flash.warn');
		
		warn.hide();
		tempoEl.removeClass('verySlow veryFast');
		
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
	},
	
	changeTempoSlide: function() {
		var tempoEl = this.$el.find('.tempo');
		var val = tempoEl.find('input[name=tempoSlide]').val();
		
		val = parseFloat(val).toFixed(1);
		this.updateTempoText(val);
		tempoEl.removeClass('verySlow veryFast');
		
		playerView.publish('playerViewTempo', val);
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

	repeat: function(ev) {
		var on = $(ev.target).is(':checked');
		playerView.publish('playerViewRepeat', on);
	}
});


/**
 *  SUBSCRIBES
 */
playerView.subscribe('playerStop', function() {
	view.stop();
});

playerView.subscribe('musicalStructTempo', function(tempo) {
	view.updateTempoText(tempo);
	view.updateTempoSlide(tempo);
});


/**
 *  Module initialization method
 */
function initialize() {
	view = new PlayerView();
};

/**
 *  PUBLIC API
 */
module.exports = {
	initialize: initialize
}
