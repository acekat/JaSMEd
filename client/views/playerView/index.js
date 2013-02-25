var playerView = {};

/**
 *  DEPENDENCIES
 */
var Backbone = window.Backbone  //require('Backbone')
  , $ = window.$ //require('jquery');
  , bus = require('bus');

/**
 *  INSTANCES
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
    var tempoEl = this.$el.find('.tempo')
      , val = tempoEl.find('input[name=tempoText]').val()
      , warn = tempoEl.find('.flash.warn');
    
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
    
    bus.emit('playerViewTempo', val);
  },
  
  changeTempoSlide: function() {
    var tempoEl = this.$el.find('.tempo')
      , val = tempoEl.find('input[name=tempoSlide]').val();
    
    val = parseFloat(val).toFixed(1);
    this.updateTempoText(val);
    tempoEl.removeClass('verySlow veryFast');
    
    bus.emit('playerViewTempo', val);
  },
  
  updateTempoSlide: function(val) {
    this.$el.find('.tempo input[name=tempoSlide]').val(val);
  },
  
  updateTempoText: function(val) {
    this.$el.find('.tempo input[name=tempoText]').val(val);
  },
  
  playPause: function(ev) {
    // ps: using ev.target in other handlers could be faster than $el.find..
    var button = $(ev.target)
      , isPlaying = button.hasClass('playing');
    
    if (isPlaying) {
      bus.emit('playerViewPause');
      button.removeClass('playing');
      button.html('play');
    } else {
      bus.emit('playerViewPlay');
      button.addClass('playing');
      button.html('pause');
    }
  },

  stop: function() {
    var button = this.$el.find('.playPause');
    
    bus.emit('playerViewStop');
    button.removeClass('playing');
    button.html('play');
  },

  repeat: function(ev) {
    var on = $(ev.target).is(':checked');
    bus.emit('playerViewRepeat', on);
  }
});


/**
 *  SUBSCRIBES
 */
bus.on('playerStop', function() {
  view.stop();
});

bus.on('musicalStructTempo', function(tempo) {
  view.updateTempoText(tempo);
  view.updateTempoSlide(tempo);
});


/**
 *  Module initialization method
 */
function initialize() {
  view = new PlayerView();
}

/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize
};
