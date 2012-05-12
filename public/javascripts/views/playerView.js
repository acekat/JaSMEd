(function(playerView) {

/**
 *  Associated View to utils Module.
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
		'click .play' : 'play',
		'click .pause' : 'pause',
		'click .stop' : 'stop'
	},

	play: function() {
		console.log('clicked on play');
		playerView.publish('play');
	},

	pause: function() {
		console.log('clicked on pause');
		playerView.publish('pause');
	},

	stop: function() {
		console.log('clicked on stop');
		playerView.publish('stop');
	}

});

var view;

/**
 *  Module initialization method
 */
playerView.initialize = function() {
	view = new PlayerView();
};

})(jasmed.module('playerView'));
