(function(toolsView) {

/**
 *  Associated View to toolsView Module.
 *  @type {Backbone.View}
 */
var ToolsView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: ".utils",

	/** @constructs */
	initialize: function() {
		warned: false
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"click .add-block" : "newBlock",
		"click .zoom-in" : "zoomIn",
		"click .zoom-out" : "zoomOut",
		"submit .export-button": "exportAs"
	},

	newBlock: function() {
		toolsView.publish("newBlock");
	},

	zoomIn: function() {
		toolsView.publish('zoom', true);
	},

	zoomOut: function() {
		toolsView.publish('zoom', false);
	},

	exportAs: function() {
		console.log('in export as');
		var name = $('.export input').val();

		if (name === '') {
			warned = true;
			var warnDiv = $(document.createElement('div'));
			warnDiv.addClass('flash warn').append('<p>please provide an export name!!</p>')
			$('.utils .export').append(warnDiv);
			return;
		}
		
		warned && $('.utils .export .flash.warn').remove();
		warned = false;

		toolsView.publish('exportAs', name);
	}

});

var view;

/**
 *  Module initialization method
 */
toolsView.initialize = function() {
	view = new ToolsView();
};

})(jasmed.module('toolsView'));
