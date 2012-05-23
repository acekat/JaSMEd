(function(playerView) {

/**
 *  Global variables
 */
var view;


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
		'click .playerControls .playPause' : 'playPause',
		'click .playerControls .stop' : 'stop',
		'change .trackSelector input' : 'selectTrack'
	},

	selectTrack: function() {
		var track = $(this.el).find('.trackSelector input:checked').val();
		playerView.publish('playerViewTrack', track);
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

	stop: function(ev) {
		var button = $(this.el).find('.playerControls .playPause');
		
		playerView.publish('playerViewStop');
		button.removeClass('playing');
		button.html('play');
	},
});


/**
 *  Module initialization method
 */
playerView.initialize = function() {
	view = new PlayerView();
};

/**
 *  SUBSCRIBES
 */
playerView.subscribe('playerStop', function() {
	view.stop();
});

})(jasmed.module('playerView'));
