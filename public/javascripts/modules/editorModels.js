(function(editor) {

/**
 *  DEPENDENCIES
 */
var LayersView = jasmed.module('editorViews').LayersView;
var EditorView = jasmed.module('editorViews').EditorView;

/**
 *  CONFIGURATION
 */
var scrollMargin = 15;
var defaultBlockWidth = 200;
var minBlockWidth = 100;
var resizeFactor = 50;
var defaultSub = 4;
var nbOctave = 7;
var pitches = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];

/**
 *  INSTANCES
 */
var editorModel;
var editorView;

/**
 *  MODELS & COLLECTIONS
 */

/**
 *  Instance of a layer in a block.
 *  @type {Backbone.Model}
 */
var Layer = Backbone.Model.extend({

	/**
	 *  Default values of a Layer attributes.
	 */
	defaults : function() {
		return {
			block : null,
			sub : defaultSub,
			cellOn : {},
			editable : true
		}
	},

	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Toggle editable variable.
	 */
	toggleEdit : function() {
		this.set({"editable" : !this.get("editable")});
	},

	/**
	 *  Add/Remove cellId to/from the cellOn array.
	 *  @param  {String} cellId 	HTML id of the cell to turn on/off
	 *  @param  {String} user 		login of user that toggled the cell
	 *  @param  {String} className 	HTML classes of the toggled cell
	 */
	toggleCell : function(cellId, user, className) {
		var cellOn = this.get("cellOn");

		if (!_.has(cellOn, cellId))
			// turn on
			cellOn[cellId] = [user, className];
		else
			// turn off
			delete cellOn[cellId];
		
		// trigger the change event on cellOn object with cellOn object argument
		var retCellOn = {};
		retCellOn[cellId] = [user, className];
		this.trigger("change:cellOn", retCellOn);		
	}

});

/**
 *  Collection of Layer.
 *  @type {Backbone.Collection}
 */
var Layers = Backbone.Collection.extend({

	/**
	 *  Associated model.
	 *  @type {Backbone.Model}
	 */
	model : Layer,
	
	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Find the first (should be the only) editable Layer.
	 *  @return {Backbone.Model} Layer
	 */
	editable : function() {
		return this.find(function(layer) { 
			return layer.get("editable"); 
		});
	},

	/**
	 *  Find the first (should be the only) Layer with corresponding subdivision number.
	 *  @param  {number} sub 	number of subdivision that contain the searched layer
	 *  @return {Backbone.Model} Layer
	 */
	getSub : function(sub) {
		return this.find(function(layer) {
			return layer.get("sub") === sub;
		});
	}

});

/**
 *  Instance of a block in a grid.
 *  Block contains a collection of Layer (Layers).
 *  @type {Backbone.Model}
 */
var Block = Backbone.Model.extend({

	/**
	 *  Default values of a Block attributes.
	 */
	defaults : function() {
		return {
			width : defaultBlockWidth,
			order : editorModel.grid.nextOrder()
		}
	},

	/** @constructs */
	initialize : function() {
		// use a width of reference to prevent unlimited widening of a block
		this.refWidth = this.get("width");

		// add new Block "anchor" to DOM
		$('<div class="block b-'+this.get("order")+'" style="width: '+this.refWidth+'px;"></div>').appendTo(".grid");
		
		// create new Layers and associated View
		this.layers = new Layers();
		this.layersView = new LayersView({
			collection: this.layers,
		});
		this.layersView.block = this;

		// add a first new Layer
		this.layers.add({
			block : this.get("order")
		});
	},

	/**
	 *  Set the new width.
	 *  @param  {boolean} zoom 					true: increase width, false: descrease width
	 *  @param  {number} [factor=resizeFactor] 	added/subtracted number of pixels when zoom in/out 
	 */
	resize : function(zoom) {
		var width = this.refWidth;
		var sub = this.layers.editable().get("sub");
		var factor = !_.isUndefined(arguments[1]) ? arguments[1] : resizeFactor;
		var newWidth;

		if (zoom) {
			newWidth = Math.ceil((width+factor)/sub) * sub;
			this.refWidth += factor;
		} else {
			newWidth = Math.ceil((width-factor)/sub) * sub;
			this.refWidth -= factor;
		}

		this.set({"width" : newWidth});
	}

});

/**
 *  Collection of Block.
 *  @type {Backbone.Collection}
 */
var Grid = Backbone.Collection.extend({

	/**
	 *  Associated model.
	 *  @type {Backbone.Model}
	 */
	model : Block,
	
	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Find the first (should be the only) Block with corresponding order.
	 *  @param  {number} order 		Block order
	 *  @return {Backbone.Model}
	 */
	getBlock : function(order) {
		return this.find(function(block) {
			return block.get("order") === order;
		});
	},

	/**
	 *  Calculate order of a new Block.
	 *  @return {number} number of the last Block + 1
	 */
	nextOrder : function() {
		if (!this.length) return 1;
		return this.last().get("order") + 1;
	},

	/**
	 *  Toggle cell in the selection.
	 *  @param  {object} selection 	object representing the selection
	 */
	selectRange : function(selection) {
		var pitch = selection.pitch,
			startCell = selection.startCell,
			endCell = selection.endCell,
			user = selection.user;
		var sub = startCell.layer;

		for (var blockOrder = startCell.block; blockOrder <= endCell.block; blockOrder++) {
			var layers = this.getBlock(blockOrder).layers;
			
			// create layer if it doesn't exist
			if (!layers.getSub(sub)) {
				layers.add({
					block : blockOrder,
					sub : sub,
					editable : false
				});
			};

			var firstCell = (blockOrder == startCell.block) ? startCell.cell : 1;
			var lastCell = (blockOrder == endCell.block) ? endCell.cell : sub;

			// toggle cells in the corresponding layer and block
			for (var cell = firstCell; cell <= lastCell; cell++) {
				var id = blockOrder+'-'+sub+'-'+pitch+'-'+cell;

				var className = 'note-'+startCell.block+'-'+sub+'-'+pitch+'-'+startCell.cell;
				className += ((cell == endCell.cell) && (blockOrder == endCell.block)) ? " note-end" : "";

				layers.getSub(sub).toggleCell(id, user, className);
			};
		};
	}
});

/**
 *  Editor is the root Model that contains a Grid collection.
 *  @type {Backbone.Model}
 */
var Editor = Backbone.Model.extend({
	initialize: function() {
		this.grid = new Grid();

		editorView = new EditorView({
			collection: this.grid  //could be changed to editorModel?
		});
	},
	
	xport: function(opt) {
		var result = {},
			settings = _({
				recurse: true
			}).extend(opt || {});

		function process(targetObj, source) {
			targetObj.attrs = source.toJSON();
			_.each(source, function (value, key) {
				if (settings.recurse) {
					if (key !== 'collection' && source[key] instanceof Backbone.Collection) {
						targetObj.collections = targetObj.collections || {};
						targetObj.collections[key] = {};
						targetObj.collections[key].models = [];
						_.each(source[key].models, function (value, index) {
							process(targetObj.collections[key].models[index] = {}, value);
						});
					//not sure what 'parent' does... probs needz removing
					} else if (key !== 'parent' && source[key] instanceof Backbone.Model) {
						targetObj.models = targetObj.models || {};
						process(targetObj.models[key] = {}, value);
					}
				}
			});
		}

		process(result, this);
		return result;
	},
	
	mport: function(data, silent) {
		function process(targetObj, data) {
			console.log('process called with: ');
			console.log('targetObj: ' + JSON.stringify(targetObj));
			console.log('data: ' + JSON.stringify(data));
			targetObj.set(data.attrs, {silent: silent});
			/* bubble test
			_.each(data.attrs, function (value, key) {
				console.log('setting obj[' + key + '] = ' + JSON.stringify(value));
				targetObj.set(key, value, {silent: silent});
			})
			*/
			if (data.collections) {
				_.each(data.collections, function (collection, name) {
					console.log('(collection) about to do ' + name);
					_.each(collection.models, function (modelData, index) {
						console.log('(model in collection) about to do ' + name + '.models[' + index +']');
						targetObj[name].add();
						var nextObject = targetObj[name].models[index];
						//var nextObject = targetObj[name].add({}, {silent: silent});
						//var nextObject = targetObj[name].get(modelData.attrs.id) || targetObj[name]._add({}, {silent: silent});
						process(nextObject, modelData);
					});
				});
			}

			if (data.models) {
				_.each(data.models, function (modelData, name) {
					console.log('(model) about to do ' + name);
					process(targetObj[name], modelData);
				});
			}
		}

		process(this, data);
		return this;
	}
});


/**
 *  VIEWS
 */

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
			editor.publish('toggleSelection', {
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
 *  INITIALIZATION
 */

/**
 *  Module initialization method
 */
editor.initialize = function() {
	editorModel = new Editor();
	editor.publish('editorInit');
};

function loadExistingGrid(grid) {
	console.log('about to update grid with: ' + JSON.stringify(grid));
	console.log('which actually is: ' + JSON.stringify(editorModel.mport(grid)));
}

function createNewGrid() {
	// Add 2 Blocks to begin
	editorModel.grid.add();
	editorModel.grid.add();

	// for (var i = 0; i < 32; i++) {
	// 	editorModel.grid.add();
	// };
}


/**
 *  SUBSCRIBES
 */

/**
 *  Initialize editor (response from server)
 *  @param  {object} grid object if exists, null otherwise
 */
editor.subscribe('editorInitRes', function(seq) {
	console.log('editor received editorInitRes');
	if (!seq)
		return createNewGrid();
		
	document.title += (' - ' + seq.name);
	loadExistingGrid(seq.data);
});

/**
 *  Export grid
 */
editor.subscribe('exportAs', function(name) {
	editor.publish('editorGridExport', {
		name: name,
		data: editorModel.xport()
	});
});

/**
 *  Toggle selection received
 *  @param  {object} selection object with the selection variables
 */
editor.subscribe("toggleSelectionRes", function(selection) {
	editorModel.grid.selectRange(selection);
});

/**
 *  Add new Block
 */
editor.subscribe('newBlockRes', function() {
	editorView.newBlock();
});

/**
 * Zoom in/out
 */
editor.subscribe('zoom', function(arg) {
	editorView.zoom(arg);
});

/**
 *  PUBLIC API
 */
editor.rootModel = editorModel;
// this is only for debugging.. won't happen in production
// evrytin private!

})(jasmed.module('editorModels'));
