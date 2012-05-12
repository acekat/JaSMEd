(function(editorViews) {

var user,
	pitch,
	startCell,
	startCellId,
	startLeft,
	startWidth,
	endCell,
	endCellId,
	endLeft,
	endWidth;
var gridWin,
	gridWinDim;

/**
 *  Associated View to Layer Model.
 *  @type {Backbone.View}
 */
var LayerView = Backbone.View.extend({

	/**
	 *  Class attribute of the div associated to the View.
	 *  @type {String}
	 */
	className : "layer",

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {object}
	 */
	events : {
		"mousedown .cell" : "startingCell",
		"mousemove .cell" : "movingCell",
		"mouseup .cell" : "endingCell"
	},

	/** @constructs */
	initialize : function() {
		// function that render Underscore templating
		this.layerTemplate = _.template($("#layer-template").html());

		// Bound events
		this.model.on("change:cellOn", this.toggleCell);
		this.model.on("change:sub", this.actualize, this);
	},

	/**
	 *  Render the View of a Layer.
	 *  @return {Backbone.View} self View to enable chained calls
	 */
	render : function() {
		var layer = this.model;
		$(this.el)
			.html(this.layerTemplate({
				octave : nbOctave,
				block : layer.get("block"),
				sub : layer.get("sub"),
				cellOn : layer.get("cellOn"),
				pitches : pitches
			}))
			.addClass('sub-'+layer.get("sub"));

		if (layer.get("editable")) {
			$(this.el).addClass("editable");
		};

		return this;
	},

	/**
	 *  Actualize the Layer View
	 *  @param  {Backbone.Model} layer layer to actualize
	 */
	actualize : function(layer) {
		$(this.el).html(this.layerTemplate({
			octave : nbOctave,
			block : layer.get("block"),
			sub : layer.get("sub"),
			cellOn : layer.get("cellOn"),
			pitches : pitches
		}));

		// TO-DO: need to resize Block width?
	},

	/**
	 *  Toggle the "on" class on the selected cell div.
	 *  @param  {object} cellOn cells being toggled
	 */
	toggleCell : function(cellOn) {
		// TO-DO: test if it's a layer model or a cellOn object
		// DONE'D (a bit quickly though... could be messy in future)
		if (cellOn instanceof Layer)
			cellOn = cellOn.get('cellOn');
		
		_.each(cellOn, function(value, cellId) {
			var el = $('#'+cellId);
			var cellClass = 'user-'+value[0]+' '+value[1];
			var curClass = el.attr("class").match("user-[^ ]*");
					
			if (curClass)
				el.removeClass(curClass[0]);
			
			el.toggleClass("on");
			
			if (el.hasClass("on"))
				el.addClass(cellClass);
		});
	},

	/**
	 *  Initialize selection variables on mousedown.
	 *  @param  {object} e event object fired
	 */
	startingCell : function(e) {
		startCellId = e.target.id;

		// 0: Block, 1: Layer, 2: Pitch, 3: Cell
		var idArray = startCellId.split("-");
		startCell = {
			block : parseInt(idArray[0]),
			layer : parseInt(idArray[1]),
			cell : parseInt(idArray[3])
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
	movingCell : function(e) {
		// Scrolling
		// down
		if ((e.pageY + scrollMargin) > (gridWinDim.top + gridWinDim.height))
			gridWin[0].scrollTop += scrollMargin;
		// up
		if ((e.pageY - scrollMargin) < gridWinDim.top)
			gridWin[0].scrollTop -= scrollMargin;
		// right
		if ((e.pageX + scrollMargin) > (gridWinDim.left + gridWinDim.width))
			gridWin[0].scrollLeft += scrollMargin;
		// left
		if ((e.pageX - scrollMargin) < gridWinDim.left)
			gridWin[0].scrollLeft -= scrollMargin;

		/* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING CELL */
		/*
		var startLeft = editor.editorView.startLeft,
			pitch = editor.pitch;
		var currentLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;
	
		// Selecting
		if (editor.editorView.onSelection) {
			var selectables	= gridWin.find(".block").children(".editable").children(".p-"+pitch).children();
			// Optimized but can be buggy
			// var selectables	= $(this.el).children(".p-"+pitch).children();

		
			selectables.each(function () {
				var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
				var thisWidth = $(this).width();

				if (((currentLeft > startLeft) && ((thisLeft > currentLeft) || (thisLeft+thisWidth < startLeft)))
					|| ((currentLeft < startLeft) && ((thisLeft+thisWidth < currentLeft) || (thisLeft > startLeft))))
					return;

				if (((currentLeft > startLeft) && (thisLeft < currentLeft) && (thisLeft+thisWidth > startLeft))
					|| ((currentLeft < startLeft) && (thisLeft+thisWidth > currentLeft) && (thisLeft < startLeft)))
					$(this).addClass("on");
				else
					$(this).removeClass("on");
			});
		};
		*/

		e.preventDefault();
	}, 

	/**
	 *  End selection and publish it. 
	 *  @param  {object} e event object fired
	 */
	endingCell : function(e) {
		var id = e.target.id;
		user = jasmed.user;

		// 0: Block, 1: Layer, 2: Pitch, 3: Cell
		var idArray = id.split("-");
		endCell = {
			block : parseInt(idArray[0]),
			layer : parseInt(idArray[1]),
			cell : parseInt(idArray[3])
		};
		endCellId = idArray[0]+'-'+idArray[1]+'-'+pitch+'-'+idArray[3];
		endLeft = $('#'+endCellId).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
		endWidth = $('#'+endCellId).width();

		// swap end and start if not in the right order
		if (endLeft < startLeft) {
			var tmp1 = endLeft; endLeft = startLeft; startLeft = tmp1;
			var tmp2 = endWidth; endWidth = startWidth; startWidth = tmp2;
			var tmp3 = endCell; endCell = startCell; startCell = tmp3;
		};

		// check if selectection hover already on cells
		var selectable = true;
		var alreadyOn = gridWin.find(".layer").children('.p-'+pitch).children(".on");
		alreadyOn.each(function () {
			var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
			var thisWidth = $(this).width();
			var thisId = $(this).attr("id");

			// in the selection range => cancel selection
			if ((thisLeft < endLeft+endWidth) && (thisLeft+thisWidth > startLeft)) {
				alert("Pas de superposition de notes!");
				selectable = false;
				return false;
			};
		});

		// send to communication
		if (selectable) {
			editorViews.publish('toggleSelection', {
				pitch : pitch,
				startCell : startCell,
				endCell : endCell,
				user: user
			});
			
			// Testing in local
			// editor.editor.grid.selectRange({
			// 	pitch : pitch,
			// 	startCell : startCell,
			// 	endCell : endCell,
			// 	user: user
			// });
		};

		/* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING CELL */
		// editor.editorView.onSelection = false;

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
	el : ".block",

	/** @constructs */
	initialize : function() {
		// Bound events
		this.collection.on("add", this.addLayer, this);
		this.collection.on("change:editable", this.switchEdit, this);
	},

	/**
	 *  Insert in the DOM the added Layer to Layers collection.
	 *  @param {Backbone.Model} layer newly added Layer
	 */
	addLayer : function(layer) {
		// create a View for the Layer
		var layerView = new LayerView({
			model: layer
		});

		// insert in the DOM the rendered View
		if (layer.get("editable"))
			$('.b-'+this.block.get("order")).append(layerView.render().el);
		else
			$('.b-'+this.block.get("order")).prepend(layerView.render().el);
	},

	/**
	 *  Manipulate the DOM to get the correct Layer editable.
	 *  @param  {Backbone.Model} layer Layer to edit
	 */
	switchEdit : function(layer) {
		var blockOrder = '.b-'+this.block.get("order");

		$(blockOrder+' .editable').removeClass("editable");

		if (layer.get("editable")) {
			// TO-DO: find a cleaner way
			$(blockOrder+' .sub-'+layer.get("sub")).addClass("editable").appendTo(blockOrder);
		};
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
	className : "block-layer-info",

	/** @constructs */
	initialize : function() {
		this.grid = this.model.collection;

		// function that render Underscore templating
		this.layerInfoTemplate = _.template($("#layer-info-template").html());

		// correct gridWinDim.top
		gridWinDim.top = gridWin.offset().top;

		// Bound events
		this.model.on("change:width", this.resize, this);
		this.model.layers.on("change add", this.actualize, this);
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events : {
		"keypress .add-layer" : "newLayerOnEnter",
		"click .edit-layer" : "editLayer"
	},

	/**
	 *  Render the View of a Block.
	 *  @return {Backbone.View} self View to enable chained calls
	 */
	render : function() {
		var block = this.model;
		$(this.el)
			.html(this.layerInfoTemplate({ 
				layers : block.layers.models
			}))
			.addClass('bli-'+block.get("order"))
			.css({"width" : block.refWidth+'px'});

		return this;
	},

	/**
	 *  Set the new width of the Block
	 *  @param  {number} width new width in pixel
	 */
	resize : function(block) {
		var order = block.get("order"),
			width = block.get("width");

		$(".b-"+order).css({"width" : width+'px'});
		$(this.el).css({"width" : width+'px'});
	},

	/**
	 *  Actualize the View.
	 */
	actualize : function() {
		$(this.el).html(this.layerInfoTemplate({
			layers : this.model.layers.models
		}));

		// correct gridWinDim.top
		gridWinDim.top = gridWin.offset().top;
	},

	/**
	 *  Create new Layer according to the input value
	 *  @param  {object} e event object fired
	 */
	newLayerOnEnter : function(e) {
		var layers = this.model.layers;
		var input = this.$(".add-layer");
		var text = input.val();
		var sub, layer;

		// if no submit with 'enter' key
		if (!text || e.keyCode != 13) return;

		// if it's an integer
		if (!isNaN(text) && ((sub = parseInt(text)) == text)) {
			// Layer already exist
			if (layers.getSub(sub)) {
				this.editLayer(sub);
				input.val("");
				return;
			}

			// Create new one
			layers.editable().toggleEdit();
			layers.add({
				sub : sub,
				block : this.model.get("order")
			});
		}
		input.val("");

		// adapt block width according to subdivisions of the layer
		this.model.resize(true, 0);
	},

	/**
	 *  Set a Layer editable, disable old editable Layer.
	 *  @param  {object|number} e event object or sub number
	 */
	editLayer : function(e) {
		var layers = this.model.layers;
		var sub = typeof(e)=="object" ? parseInt(e.target.innerHTML) : e;

		// if Layer to set isn't already editable
		if (layers.editable() !== layers.getSub(sub)) {
			layers.editable().toggleEdit();
			layers.getSub(sub).toggleEdit();
		};

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
	el : ".editor",

	/** @constructs */
	initialize : function() {
		// display piano
		for (var o = nbOctave; o > 0; o--) {
			_.each(pitches, function(pitch, i) {
				var color = /^.#$/.test(pitch) ? "black" : "white";
				var content = /^C$/.test(pitch) ? pitch+o : "";
				$(".piano").append('<div class="piano-key '+pitch+o+' '+color+' pk-'+((12*(o+1))+(pitches.length-(i+1)))+'"><span>'+content+'</span></div>');
			});
		};

		// initialize View variables
		gridWin = $(".grid-win");
		gridWinDim = {
			left : gridWin.offset().left, 
			top : gridWin.offset().top, 
			width : gridWin.width(), 
			height : gridWin.height()
		};

		// Bound events
		this.collection.on("add", this.addBlock);
		gridWin.on("scroll", this.syncScroll);
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events : {
	},

	/**
	 *  Insert in the DOM the added Block to grid collection.
	 *  @param {Backbone.Model} block newly added Block
	 */
	addBlock : function(block) {
		// create a View for the Block
		var blockView = new BlockView({
			model: block
		});

		// insert in the DOM the rendered View
		$(".layer-info").append(blockView.render().el);

		// adapt block width according to subdivisions of the layer
		blockView.model.resize(true, 0);
	},

	/**
	 *  Add a new Block to the Grid collection.
	 */
	newBlock : function() {
		var width = this.collection.last().refWidth;
		this.collection.add({
			width : width
		});
	},

	/**
	 *  Synchronize scrolling between the grid, piano and layer-info window.
	 *  @param  {object} e event object fired
	 */
	syncScroll: function(e) {
		$(".piano-win").scrollTop(e.target.scrollTop);
		$(".layer-info-win").scrollLeft(e.target.scrollLeft);
	},

	/**
	 *  Zoom in ou out in the Grid.
	 *  @param  {boolean} zoom 	true: zoom in, false: zoom out
	 */
	zoom: function(zoom) {
		_.map(this.collection.models, function(block) {
			if (!zoom && (block.get("width") <= minBlockWidth)) 
				return false;
			
			block.resize(zoom);
		});

		// correct gridWinDim.top
		gridWinDim.top = gridWin.offset().top;
	}

});

/**
 *  PUBLIC API
 */
editorViews = {
	LayersView: LayersView,
	EditorView: EditorView
};
// the only two Constructors editorModel depends on.

})(jasmed.module('editorViews'));