(function(toolsView) {

/**
 *  Global variables
 */
var view;


/**
 *  Associated View to toolsView Module.
 *  @type {Backbone.View}
 */
var ToolsView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: ".tools",

	/** @constructs */
	initialize: function() {
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"click .add-block" : "newBlock",
		"click .zoom-in" : "zoomIn",
		"click .zoom-out" : "zoomOut",
		"click .export-as" : "exportAs"
	},

	newBlock: function() {
		toolsView.publish("toolsNewBlock");
	},

	zoomIn: function() {
		toolsView.publish("toolsZoom", true);
	},

	zoomOut: function() {
		toolsView.publish("toolsZoom", false);
	},

	exportAs: function(e) {
		var warn = this.$(".flash.warn");
		var name = this.$("#export-as").val();

		warn.hide();
		
		//ajouter warn -> ne peut y avoir de '.' dans le nom...

		if (name === "") {
			warn.show();
			return;
		}

		toolsView.publish("toolsExport", name);
	}

});


/**
 *  Module initialization method
 */
toolsView.initialize = function() {
	view = new ToolsView();
};

})(jasmed.module('toolsView'));
