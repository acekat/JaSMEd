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
		'click .playerControls .play' : 'play',
		'click .playerControls .pause' : 'pause',
		'click .playerControls .stop' : 'stop',
		'change .trackSelector input' : 'selectTrack'
	},

	selectTrack: function() {
		var track = $(this.el).find('.trackSelector input:checked').val();
		playerView.publish('playerViewTrack', track);
	},
	
	play: function() {
		playerView.publish('playerViewPlay');
	},

	pause: function() {
		playerView.publish('playerViewPause');
	},

	stop: function() {
		playerView.publish('playerViewStop');
	}

});


/**
 *  Module initialization method
 */
playerView.initialize = function() {
	view = new PlayerView();
};

})(jasmed.module('playerView'));
