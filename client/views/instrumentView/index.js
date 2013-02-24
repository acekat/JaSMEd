var instrumentView = {};

/**
 *  DEPENDENCIES
 */
var Backbone = require('Backbone');
require('../modules/mediator').installTo(instrumentView);

/**
 *  INSTANCES
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
    'change .waveFormSelector input' : 'selectWaveForm',
    'mouseup .sustainSlider input' : 'slideSustain'
  },

  selectWaveForm: function() {
    var wave = this.$el.find('.waveFormSelector input:checked').val();
    instrumentView.publish('instrumentViewWaveForm', wave);
  },

  slideSustain: function(e) {
    var value = this.$el.find('.sustainSlider input').val() / 100;
    instrumentView.publish('instrumentViewSustain', value);
  }

});

/**
 *  Module initialization method
 */
function initialize() {
  view = new InstrumentView();
}

/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize
};
