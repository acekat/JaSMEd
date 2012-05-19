(function(editorModels) {

/**
 *  INSTANCES
 */
var editor;


/**
 *  CONFIGURATION
 */
var defaultBlockWidth = 200;
var resizeFactor = 50;
var defaultSub = 4;


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
			order : editor.grid.nextOrder()
		}
	},

	/** @constructs */
	initialize : function() {
		// use a width of reference to prevent unlimited widening of a block
		this.refWidth = this.get("width");

		// add new Block "anchor" to DOM
		$(document.createElement('div'))
			.addClass('block b-'+this.get("order"))
			.css({"width" : this.refWidth+'px'})
			.appendTo(".grid");

		// create new Layers and associated View
		this.layers = new Layers();

		// only on client-side
		editorModels.publish("editorModelsNewLayers", {
			layers : this.layers,
			block : this
		})

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
		var factor = _.isUndefined(arguments[1]) ? resizeFactor : arguments[1];
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

			var firstCell = (blockOrder === startCell.block) ? startCell.cell : 1;
			var lastCell = (blockOrder === endCell.block) ? endCell.cell : sub;

			// toggle cells in the corresponding layer and block
			for (var cell = firstCell; cell <= lastCell; cell++) {
				var id = blockOrder+'-'+sub+'-'+pitch+'-'+cell;

				var className = 'note-'+startCell.block+'-'+sub+'-'+pitch+'-'+startCell.cell;
				className += ((cell === startCell.cell) && (blockOrder === startCell.block)) ? " note-start" : "";
				className += ((cell === endCell.cell) && (blockOrder === endCell.block)) ? " note-end" : "";

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
	
	/** @constructs */
	initialize : function() {
		this.grid = new Grid();

		// only on client-side
		jasmed.module("editorViews").initialize(this.grid);
	},
	
	xport : function(opt) {
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
	
	mport : function(data, silent) {
		function process(targetObj, data) {
			targetObj.set(data.attrs, {silent: silent});

			if (data.collections) {
				_.each(data.collections, function (collection, name) {
					_.each(collection.models, function (modelData, index) {
						var targetCol = targetObj[name];
						targetCol.remove(targetCol.models[index]).add({}, {at: index});
						var nextObject = targetCol.models[index];
						process(nextObject, modelData);
					});
				});
			}

			if (data.models) {
				_.each(data.models, function (modelData, name) {
					process(targetObj[name], modelData);
				});
			}
		}

		process(this, data);
		return this;
	},

	newGrid : function() {
		// Add 2 Blocks to begin
		this.grid.add();
		this.grid.add();

		// for (var i = 0; i < 32; i++) {
		// 	this.grid.add();
		// };
		
		console.log("New Grid!");
	},

	loadGrid : function(grid) {
		this.mport(grid);
		console.log("Grid loaded!");
	}

});


/**
 *  SUBSCRIBES
 */

/**
 *  Initialize editor (response from server)
 *  @param  {object} grid object if exists, null otherwise
 */
editorModels.subscribe("serverInit", function(seq) {
	if (!seq)
		return editor.newGrid();
		
	document.title += ' - '+seq.name;
	editor.loadGrid(seq.data);
});

/**
 *  Export grid
 */
editorModels.subscribe("toolsExport", function(name) {
	editorModels.publish("editorModelsExport", {
		name : name,
		data : editor.xport()
	});
});

/**
 *  Add new Block
 */
editorModels.subscribe("structNewBlock", function() {
	var width = editor.grid.last().refWidth;
	editor.grid.add({
		width : width
	});
});

editorModels.subscribe("serverNewBlock", function() {
	var width = editor.grid.last().refWidth;
	editor.grid.add({
		width : width
	});
});

/**
 *  Selection from structure
 *  @param  {object} selection object with the selection variables
 */
editorModels.subscribe("structSelection", function(selection) {
	editor.grid.selectRange(selection);
});

editorModels.subscribe("serverSelection", function(selection) {
	editor.grid.selectRange(selection);
});


/**
 *  INITIALIZATION
 */

/**
 *  Module initialization method
 */
editorModels.initialize = function() {

	editor = new Editor();
	
	editorModels.publish("editorModelsInit");
};

})(jasmed.module("editorModels"));
