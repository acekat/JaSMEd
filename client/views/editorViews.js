var editorViews = {};

/**
 *  DEPENDENCIES
 */
var Backbone = require('Backbone')
  , _ = require('underscore')
  ;

require('../modules/mediator').installTo(editorViews);

/**
 *  INSTANCES
 */
var editorView


/**
 *  CONFIGURATION
 */
var SCROLL_MARGIN = 30
  , MIN_BLOCK_WIDTH = 100
  , NB_OCTAVE = 7
  , PITCHES = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C']
  ;

/* cursor */
var DEFAULT_TEMPO = 4
  , TEMPO = DEFAULT_TEMPO // seconds per block
  , CURSOR_INITIAL_POS = 0
  , VENDOR_PREFIXES = ['-webkit-', '-moz-']
  ;


/**
 *  GLOBAL VARIABLES
 */
var user
  , pitch
  , startCell
  , startCellId
  , startLeft
  , startWidth
  , endCell
  , endCellId
  , endLeft
  , endWidth
  , gridWin
  , gridWinDim
  ;


/**
 *  Associated View to Layer Model.
 *  @type {Backbone.View}
 */
var LayerView = Backbone.View.extend({

  /**
   *  Class attribute of the div associated to the View.
   *  @type {String}
   */
  className: 'layer',

  /**
   *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
   *  @type {object}
   */
  events: {
      'mousedown .cell': 'startingCell'
    , 'mousemove .cell': 'movingCell'
    , 'mouseup .cell': 'endingCell'
  },

  /** @constructs */
  initialize: function() {
    // function that render Underscore templating
    this.layerTemplate = _.template($('#layer-template').html());

    // Bound events
    this.model.on('change:cellOn', this.toggleCell);
    // block is changed before sub on mport, better not to duplicate actualize
    // this.model.on("change:sub", this.actualize, this);
    this.model.on("change:block", this.actualize, this);
  },

  /**
   *  Render the View of a Layer.
   *  @return {Backbone.View} self View to enable chained calls
   */
  render: function() {
    var layer = this.model
      , sub = layer.get('sub')
      ;
    
    this.$el
      .html(this.layerTemplate({
          octave: NB_OCTAVE
        , block: layer.get('block')
        , sub: sub
        , cellOn: layer.get('cellOn')
        , pitches: PITCHES
      }))
      .addClass('sub-'+sub);

    if (layer.get('editable')) {
      this.$el.addClass('editable');
    }

    return this;
  },

  /**
   *  Actualize the Layer View
   *  @param  {Backbone.Model} layer layer to actualize
   */
  actualize: function(layer) {
    var sub = layer.get('sub');

    this.$el
      .html(this.layerTemplate({
          octave: NB_OCTAVE
        , block: layer.get('block')
        , sub: sub
        , cellOn: layer.get('cellOn')
        , pitches: PITCHES
      }))
      .attr('class', function(i, attr) {
        return attr.replace(/sub-\d+/, 'sub-'+sub);
      });

    // TODO: need to resize Block width?
  },

  /**
   *  Toggle the "on" class on the selected cell div.
   *  @param  {object} cellOn cells being toggled
   */
  toggleCell: function(cellOn) {
    if (_.has(cellOn, 'cid'))
      cellOn = cellOn.get('cellOn');
    
    _.each(cellOn, function(value, cellId) {
      var el = $('#'+cellId)
        , cellClass = 'user-'+value[0]+' '+value[1]
        , curClass = el.attr('class').match(/user-[^ ]*/)
        ;
          
      if (curClass)
        el.removeClass(curClass[0]);
      
      el.toggleClass('on');
      
      if (el.hasClass('on'))
        el.addClass(cellClass);
    });
  },

  /**
   *  Initialize selection variables on mousedown.
   *  @param  {object} e event object fired
   */
  startingCell: function(e) {
    startCellId = e.target.id;

    // 0: Block, 1: Layer, 2: Pitch, 3: Cell
    var idArray = startCellId.split('-');
    startCell = {
        block: parseInt(idArray[0])-1 // shift with structure
      , layer: parseInt(idArray[1])
      , cell: parseInt(idArray[3])
    };
    pitch = parseInt(idArray[2]);
    startLeft = $('#'+startCellId).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
    startWidth = $('#'+startCellId).width();

    /* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING CELL */
    // editor.editorView.onSelection = true;

    e.preventDefault();
  },

  /**
   *  Scroll grid according to mouse position.
   *  @param  {object} e event object fired
   */
  movingCell: function(e) {
    // Scrolling
    // // down
    // if ((e.pageY + SCROLL_MARGIN) > (gridWinDim.top + gridWinDim.height))
    //  gridWin[0].scrollTop += SCROLL_MARGIN;
    // // up
    // if ((e.pageY - SCROLL_MARGIN) < gridWinDim.top)
    //  gridWin[0].scrollTop -= SCROLL_MARGIN;
    // right
    if ((e.pageX + SCROLL_MARGIN) > (gridWinDim.left + gridWinDim.width))
      gridWin[0].scrollLeft += SCROLL_MARGIN;
    // left
    if ((e.pageX - SCROLL_MARGIN) < gridWinDim.left)
      gridWin[0].scrollLeft -= SCROLL_MARGIN;

    /* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING CELL */
    // var startLeft = editor.editorView.startLeft,
    //   pitch = editor.pitch;
    // var currentLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;
  
    // // Selecting
    // if (editor.editorView.onSelection) {
    //   var selectables = gridWin.find(".block").children(".editable").children(".p-"+pitch).children();
    //   // Optimized but can be buggy
    //   // var selectables  = $(this.el).children(".p-"+pitch).children();

    
    //   selectables.each(function () {
    //     var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
    //     var thisWidth = $(this).width();

    //     if (((currentLeft > startLeft) && ((thisLeft > currentLeft) || (thisLeft+thisWidth < startLeft)))
    //       || ((currentLeft < startLeft) && ((thisLeft+thisWidth < currentLeft) || (thisLeft > startLeft))))
    //       return;

    //     if (((currentLeft > startLeft) && (thisLeft < currentLeft) && (thisLeft+thisWidth > startLeft))
    //       || ((currentLeft < startLeft) && (thisLeft+thisWidth > currentLeft) && (thisLeft < startLeft)))
    //       $(this).addClass("on");
    //     else
    //       $(this).removeClass("on");
    //   });
    // }
    

    e.preventDefault();
  }, 

  /**
   *  End selection and publish it. 
   *  @param  {object} e event object fired
   */
  endingCell: function(e) {
    var id = e.target.id;
    user = require('../modules/communicator').getUser();

    // 0: Block, 1: Layer, 2: Pitch, 3: Cell
    var idArray = id.split('-');
    endCell = {
        block : parseInt(idArray[0])-1 // shift with structure
      , layer : parseInt(idArray[1])
      , cell : parseInt(idArray[3])
    };
    endCellId = idArray[0]+'-'+idArray[1]+'-'+pitch+'-'+idArray[3];
    endLeft = $('#'+endCellId).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
    endWidth = $('#'+endCellId).width();

    // swap end and start if not in the right order
    if (endLeft < startLeft) {
      var tmp1 = endLeft; endLeft = startLeft; startLeft = tmp1;
      var tmp2 = endWidth; endWidth = startWidth; startWidth = tmp2;
      var tmp3 = endCell; endCell = startCell; startCell = tmp3;
    }

    // check if selectection hover already on cells
    var selectable = true
      , alreadyOn = gridWin.find('.layer').children('.p-'+pitch).children('.on')
      ;
    
    alreadyOn.each(function () {
      var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft
        , thisWidth = $(this).width()
        , thisId = $(this).attr('id')
        ;

      // TODO: make it better!
      // in the selection range => cancel selection
      if ((thisLeft < endLeft+endWidth) && (thisLeft+thisWidth > startLeft)) {
        alert('Pas de superposition de notes!');
        selectable = false;
        return false;
      }
    });

    // send to communication
    if (selectable)
      editorViews.publish('editorViewsSelection', {
          pitch: pitch
        , startCell: startCell
        , endCell: endCell
        , user: user
      });

    /* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING CELL */
    // editor.editorViews.onSelection = false;

    e.preventDefault();
  }

});

/**
 *  Associated View to Layers Collection.
 *  @type {Backbone.view}
 */
var LayersView = Backbone.View.extend({

  /**
   *  div associated to the View.
   *  @type {String}
   */
  el: '.layers',

  /** @constructs */
  initialize: function() {
    // array of all the layerViews
    this.layerViews = [];

    // Bound events
    this.collection.on('add', this.addLayer, this);
    this.collection.on('remove', this.removeLayer, this);
    this.collection.on('change:editable', this.switchEdit, this);
  },

  /**
   *  Get the view associated to a layer
   *  @param  {Layer} layer model you whant the view
   *  @return {LayerView}       the wanted view
   */
  getLayerView: function(layer) {
    return _.find(this.layerViews, function(layerView) { 
      return layerView.model === layer;
    });
  },

  /**
   *  Insert in the DOM the added Layer to Layers collection.
   *  @param {Backbone.Model} layer newly added Layer
   */
  addLayer: function(layer) {
    // create a View for the Layer
    var layerView = new LayerView({
      model: layer
    });

    this.layerViews.push(layerView);

    // insert in the DOM the rendered View
    var layersDOM = $('.b-'+this.block.get('order')).children('.layers'); 
    if (layer.get('editable'))
      layersDOM.append(layerView.render().el);
    else
      layersDOM.prepend(layerView.render().el);
  },

  /**
   *  Remove from the DOM the removed Layer to Layers collection.
   *  @param {Backbone.Model} layer newly added Layer
   */
  removeLayer: function(layer) {
    var view = this.getLayerView(layer);
    this.layerViews = _.without(this.layerViews, view);
    
    // remove from the DOM
    view.remove();
  },

  /**
   *  Manipulate the DOM to get the correct Layer editable.
   *  @param  {Backbone.Model} layer Layer to edit
   */
  switchEdit: function(layer) {
    var layers = '.b-'+this.block.get("order")+' .layers'
      , view = this.getLayerView(layer)
      ;

    if (layer.get('editable')) {
      $(layers+' .editable').removeClass('editable');
      view.$el.addClass('editable').appendTo(layers);
    } else {
      view.$el.removeClass('editable').prependTo(layers);
    }
  }

});

/**
 *  Associated View to Block Model.
 *  @type {Backbone.View}
 */
var BlockView = Backbone.View.extend({

  /**
   *  Class attribute of the div associated to the View.
   *  @type {String}
   */
  className: 'block',

  /** @constructs */
  initialize: function() {
    this.grid = this.model.collection;

    // function that render Underscore templating
    this.blockTemplate = _.template($('#block-template').html());
    this.layersTabsTemplate = _.template($('#layers-tabs-template').html());

    // correct gridWinDim.top
    gridWinDim.top = gridWin.offset().top;

    // hack: scroll to middle when you are on top
    if (!gridWin[0].scrollTop)
      gridWin.scrollTop(420);

    // Bound events
    this.model.on('change:width', this.resize, this);
    this.model.layers.on('change add', this.actualize, this);
  },

  /**
   *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
   *  @type {Object}
   */
  events: {
      'keypress .add-layer': 'newLayerOnEnter'
    , 'click .edit-layer': 'editLayer'
  },

  /**
   *  Render the View of a Block.
   *  @return {Backbone.View} self View to enable chained calls
   */
  render: function() {
    var block = this.model;
    this.$el
      .html(this.blockTemplate({ 
        layers: block.layers.models
      }))
      .addClass('b-'+block.get('order'))
      .css({'width': block.refWidth+'px'});

    return this;
  },

  /**
   *  Set the new width of the Block
   *  @param  {number} width new width in pixel
   */
  resize: function(block) {
    var order = block.get('order')
      , width = block.get('width')
      ;

    $('.b-'+order).css({'width': width+'px'});
    this.$el.css({'width': width+'px'});
  },

  /**
   *  Actualize the View.
   */
  actualize: function() {
    this.$el.children('.layers-tabs').html(this.layersTabsTemplate({
      layers : this.model.layers.models
    }));

    // correct gridWinDim.top
    gridWinDim.top = gridWin.offset().top;
  },

  /**
   *  Create new Layer according to the input value
   *  @param  {object} e event object fired
   */
  newLayerOnEnter: function(e) {
    var layers = this.model.layers
      , input = this.$('.add-layer')
      , text = input.val()
      , sub
      , layer
      ;

    // if no submit with 'enter' key
    if (!text || e.keyCode != 13)
      return;

    // if it's an integer
    if (!isNaN(text) && ((sub = parseInt(text)) == text)) {
      // Layer already exist
      if (layers.getSub(sub)) {
        this.editLayer(sub);
        input.val('');
        return;
      }

      // Create new one
      layers.editable().toggleEdit();
      layers.add({
          sub: sub
        , block: this.model.get('order')
      });
    }
    input.val('');

    // adapt block width according to subdivisions of the layer
    this.model.resize(true, 0);
  },

  /**
   *  Set a Layer editable, disable old editable Layer.
   *  @param  {object|number} e event object or sub number
   */
  editLayer: function(e) {
    var layers = this.model.layers
      , sub = typeof(e)=='object' ? parseInt(e.target.innerHTML) : e
      ;

    // if Layer to set isn't already editable
    if (layers.editable() !== layers.getSub(sub)) {
      layers.editable().toggleEdit();
      layers.getSub(sub).toggleEdit();
    }

    // adapt block width according to subdivisions of the layer
    this.model.resize(true, 0);
  }

});

/**
 *  Associated View to editor Module (Grid Collection).
 *  @type {Backbone.View}
 */
var EditorView = Backbone.View.extend({

  /**
   *  div associated to the View.
   *  @type {String}
   */
  el: '.grid',

  /** @constructs */
  initialize: function() {
    // display piano
    for (var o = NB_OCTAVE; o > 0; o--) {
      _.each(PITCHES, function(pitch, i) {
        var color = /^.#$/.test(pitch) ? 'black' : 'white';
        var content = /^C$/.test(pitch) ? pitch+o : '';
        var pianoKey = $(document.createElement('div'));
        pianoKey
          .addClass('piano-key '+pitch+o+' '+color+' pk-'+((12*(o+1))+(PITCHES.length-(i+1))))
          .appendTo('.piano');

        content && pianoKey.html('<span>'+content+'</span>');
      });
    }

    // initialize View variables
    gridWin = $('.grid-win');
    gridWinDim = {
        left: gridWin.offset().left 
      , top: gridWin.offset().top 
      , width: gridWin.width() 
      , height: gridWin.height()
    };

    // Bound events
    this.collection.on('add', this.addBlock);
    gridWin.on('scroll', this.syncScroll);
    
    //cache cursor selector
    this.$cursor = this.$el.find('.cursor');
  },

  /**
   *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
   *  @type {Object}
   */
  events: {
  },

  /**
   *  Insert in the DOM the added Block to grid collection.
   *  @param {Backbone.Model} block newly added Block
   */
  addBlock: function(block) {
    // create a View for the Block
    var blockView = new BlockView({
      model: block
    });

    // insert in the DOM the rendered View
    $('.grid-inner').append(blockView.render().el);

    // adapt block width according to subdivisions of the layer
    // blockView.model.resize(true, 0);
  },

  /**
   *  Synchronize scrolling between the grid, piano and layer-info window.
   *  @param  {object} e event object fired
   */
  syncScroll: function(e) {
    $('.piano').scrollTop(e.target.scrollTop);
    $('.layers-tabs').css({top: e.target.scrollTop});
  },

  /**
   *  Zoom in ou out in the Grid.
   *  @param  {boolean} zoom  true: zoom in, false: zoom out
   */
  zoom: function(zoom) {
    _.map(this.collection.models, function(block) {
      if (!zoom && (block.get('width') <= MIN_BLOCK_WIDTH)) 
        return false;
      
      block.resize(zoom);
    });

    // correct gridWinDim.top
    gridWinDim.top = gridWin.offset().top;
  },
  
  /**
   *  CURSOR
   */
  // called when player reaches new block
  moveCursor: function(blockNum) {
    var cursorEl = this.$cursor;
    this.setCustomTransitionDuration(); // remove pause hack or if customTempo, set it
    
    // lookup + add-up all previous widths... (for zoom coherence)
    this.cursorDestination = this.cursorTotalWidth(blockNum);
    // + cache it in this.cursorDestination
    
    // force transition STOP... very jumpy...
    // cursorEl.removeClass('translate');
    // cursorEl.css({left: cursorEl.position().left});   
    cursorEl.addClass('translate');
    cursorEl.css({left: this.cursorDestination});
  },
  
  resetCursor: function(repeat) {
    var cursorEl = this.$cursor;
    this.removeCustomTransitionDuration(); // remove pause hack
    cursorEl.removeClass('translate');
    
    if (repeat) {
      var clone = $(document.createElement('div'));
      
      clone.addClass('cursor');
      cursorEl.remove();
      
      var upper = $('#content .module.grid .grid-win .grid-inner').prepend(clone);
      
      upper.prepend(clone);
      this.$cursor = cursorEl = clone;
    }
    
    cursorEl.css({left: CURSOR_INITIAL_POS});
  },
  
  // when pause is clicked i need block on which it paused...
  // info is nowhere except player so i hacked this with a msg...
  pauseCursor: function(blockNum) {
    var cursorEl = this.$cursor
      , curPos = cursorEl.position().left // curent cursor position
      ;
    var pixelsLeft = this.cursorDestination - curPos // pixels left to destination
      , curBlockWidth = this.collection.getBlock(blockNum + 1).get('width') // width of block which is over the cursor
      ;
    
    // stop transition.
    cursorEl.removeClass('translate');
    cursorEl.css({left: curPos}); // FORCE the stop. otherwise will continue...

    var timeLeft = TEMPO * pixelsLeft / curBlockWidth; // time left to get to destination
    
    this.addCustomTransitionDuration(timeLeft);
  },
  
  resumeCursor: function(blockNum) {
    var cursorEl = this.$cursor
      , destination = this.cursorDestination;
    
    cursorEl.addClass('translate');
    cursorEl.css({left: destination}); // remind him the destination
  },
  
  tempoChange: function(tempo) {
    this.setCustomTransitionDuration(tempo);
  },
  
  //lookup + add-up all previous widths... (for zoom coherence)
  cursorTotalWidth: function(blockNum) {
    var range = _.first(this.collection.models, blockNum + 1);
    var totalWidth = _.reduce(range, function(memo, block) {
      return memo + block.get('width');
    }, 0);

    return CURSOR_INITIAL_POS + totalWidth;
  },
  
  addCustomTransitionDuration: function(time) {
    this.handleCustomTransitionDuration(time);
  },
  
  removeCustomTransitionDuration: function() {
    this.handleCustomTransitionDuration();
  },
  
  setCustomTransitionDuration: function() {
    if (TEMPO === DEFAULT_TEMPO)
      this.removeCustomTransitionDuration();
    else
      this.handleCustomTransitionDuration(TEMPO);
  },
  
  handleCustomTransitionDuration: function(time) {
    var cursorEl = this.$cursor
      , res = {}
      , t = (time) ? time + 's' : ''
      ;

    _.each(VENDOR_PREFIXES, function(prefix) {
      res[prefix + 'transition-duration'] = t;
    });
    res['transition-duration'] = t;

    cursorEl.css(res);
  },

  focusCursor: function() {
    var cursorLeft = parseFloat(this.$cursor.css('left'));
    gridWin.scrollLeft(cursorLeft-300);
  }
});


/**
 *  SUBSCRIBES
 */

/**
 *  Create new LayersView on visualStruct demand
 *  @param  {{Backbone.Collection} layers,
 *           {Backbone.Model} block} models Collection and Block associated to the view
 */
editorViews.subscribe('visualStructNewLayers', function(models) {
  var layersView = new LayersView({
    collection: models.layers
  });
  layersView.block = models.block;
});

/**
 *  Zoom In/Out
 *  @param  {boolean} arg true: zoom in; false: zoom out
 */
editorViews.subscribe('toolsZoom', function(arg) {
  editorView.zoom(arg);
});

editorViews.subscribe('toolsFocus', function() {
  editorView.focusCursor();
});

editorViews.subscribe('playerNextBlock', function(blockNum) {
  editorView.moveCursor(blockNum);
});

editorViews.subscribe('playerViewStop', function() {
  editorView.resetCursor();
});

//hack for cursorPause (?not really a hack...) ?what code of yours is not a hack? => FUCK YOU :)
editorViews.subscribe('playerPause', function(blockNum) {
  editorView.pauseCursor(blockNum);
});

editorViews.subscribe('playerResume', function(blockNum) {
  editorView.resumeCursor(blockNum);
});

//tempo business
editorViews.subscribe('playerTempo', function(tmpo) {
  TEMPO = tmpo;
});

editorViews.subscribe('playerRepeat', function() {
  console.log('repeat!');
  editorView.resetCursor(true);
});


/**
 *  INITIALIZATION
 */

/**
 *  Module initialization method
 */
function initialize(grid) {
  editorView = new EditorView({
    collection: grid
  });
}

/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize
}
