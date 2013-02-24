var toolsView = {};

/**
 *  DEPENDENCIES
 */
var Backbone = require('Backbone');
require('../modules/mediator').installTo(toolsView);


/**
 *  INSTANCES
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
  el: '.tools',

  /** @constructs */
  initialize: function() {
  },

  /**
   *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
   *  @type {Object}
   */
  events: {
    'click .add-block' : 'newBlock',
    'click .zoom-in': 'zoomIn',
    'click .zoom-out': 'zoomOut',
    'click .focus': 'focusCursor',
    'click .export .export-as': 'exportAs'
  },

  newBlock: function() {
    toolsView.publish('toolsNewBlock');
  },

  zoomIn: function() {
    toolsView.publish('toolsZoom', true);
  },

  zoomOut: function() {
    toolsView.publish('toolsZoom', false);
  },

  focusCursor: function() {
    toolsView.publish('toolsFocus');
  },

  exportAs: function() {
    var name = this.$el.find('.export input').val()
      , warn = this.$el.find('.flash.warn');

    warn.hide();
    
    //ajouter warn -> ne peut y avoir de '.' dans le nom...

    if (name === "") {
      warn.show();
      return;
    }

    toolsView.publish('toolsExport', name);
  }

});


/**
 *  Module initialization method
 */
function initialize() {
  view = new ToolsView();
}


/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize
};
