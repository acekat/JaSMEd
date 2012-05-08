// Module reference argument, assigned at the bottom
(function(editor) {

// blatant copy of capsule.js :)
editor.xport = function(opt) {
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
					targetObj.collections[key].id = source[key].id || null;
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
	
	process(result, editor.grid);
	return result;
};

//a remplacer par un petit bouton save qqpart...
editor.subscribe('export', function(name) {
	editor.publish('saveAs', {
		name: name,
		data: editor.xport()
	})
});

/**
 *  CONFIGURATION
 */
var scrollMargin = 15;
var defaultBlocWidth = 200;
var minBlocWidth = 100;
var resizeFactor = 50;
var defaultLayerSub = 4;
var pitches = ['do3', 'do#3', 're3', 're#3', 'mi3', 'fa3', 'fa#3', 'sol3', 'sol#3', 'la3', 'la#3', 'si3',
					'do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'la#4', 'si4'];
var user,
	pitch,
	startNote,
	startNoteId,
	startLeft,
	endNote,
	endNoteId,
	endLeft;


/**
 *  SUBSCRIBES
 */

/**
 *  Toggle selection received
 *  @param  {object} range object with the selection variables
 */
editor.subscribe("toggleSelection", function(range) {
	var gridWin = editor.grid.gridWin,
		gridWinDim = editor.grid.gridWinDim;

	var pitch = range.pitch,
		startNote = range.startNote,
		endNote = range.endNote,
		user = range.user;

	var startNoteId = startNote.bloc+'-'+startNote.layer+'-'+pitch+'-'+startNote.note,
		endNoteId = endNote.bloc+'-'+endNote.layer+'-'+pitch+'-'+endNote.note;

	var startLeft = $('#'+startNoteId).offset().left - gridWinDim.left + gridWin[0].scrollLeft,
		endLeft = $('#'+endNoteId).offset().left - gridWinDim.left + gridWin[0].scrollLeft;

	editor.grid.selectRange(pitch, startLeft, endLeft, user);
});

/**
 *  Add new Bloc
 */
editor.subscribe("newBloc", function() {
	var width = editor.grid.last().refWidth;
	editor.grid.add({
		width: width
	});
});


/**
 *  MODELS & COLLECTIONS
 */

/**
 *  Layer represent a single layer in a bloc.
 *  @type {Backbone.Model}
 */
var Layer = Backbone.Model.extend({

	/**
	 *  Default values of a Layer variables.
	 *  @type {Object}
	 */
	defaults : function() {
		return {
			sub: defaultLayerSub,
			noteOn: {},
			editable: true
		}
	},

	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Toggle <tt>editable</tt> variable
	 */
	toggleEdit: function() {
		this.set({"editable" : !this.get("editable")});
	},

	/**
	 *  Add/Remove <tt>noteId</tt> to/from the <tt>noteOn</tt> array.
	 *  @param  {String} noteId HTML id of the case to turn on/off
	 */
	toggleNote: function(noteId, user) {
		var noteOn = this.get("noteOn");

		if (!_.has(noteOn, noteId))
			// turn on
			noteOn[noteId] = user;
		else
			// turn off
			delete noteOn[noteId];
		
		// trigger the change event on noteOn array with noteId and user arguments
		this.trigger("change:noteOn", noteId, user);		
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
	model: Layer,
	
	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Find the first (should be the only) editable Layer.
	 *  @return {Backbone.Model} Layer with <tt>editable</tt> set to <tt>true</tt>
	 */
	editable: function() {
		return this.find(function(layer) { 
			return layer.get("editable"); 
		});
	},

	/**
	 *  Find the first (should be the only) Layer with corresponding subdivision number.
	 *  @param  {number} sub number of subdivision that contain the searched layer
	 *  @return {Backbone.Model}     Layer with corresponding subdivision number
	 */
	getSub: function(sub) {
		return this.find(function(layer) {
			return layer.get("sub") == sub;
		});
	}

});

/**
 *  Bloc contains a collection of Layer (Layers).
 *  Bloc is an element of the Grid.
 *  @type {Backbone.Model}
 */
var Bloc = Backbone.Model.extend({

	/**
	 *  Default values of a Bloc variables.
	 *  @return {object} key:value description of variables
	 */
	defaults : function() {
		return {
			width: defaultBlocWidth,
			order: editor.grid.nextOrder()
		}
	},

	/** @constructs */
	initialize : function() {
		// use a width of reference to prevent unlimited widening of a bloc
		this.refWidth = this.get("width");

		// add new Bloc "anchor" to DOM
		$('<div class="bloc b-'+this.get("order")+'" style="width: '+this.refWidth+'px;"></div>').appendTo(".grid");
		
		// create new Layers and associated View
		this.layers = new Layers();
		this.layersView = new LayersView({
			collection: this.layers,
		});
		this.layersView.bloc = this;

		// add a first new Layer
		this.layers.add({
			bloc: this.get("order")
		});
	},

	/**
	 *  Set the new width.
	 *  @param  {boolean} zoom true: increase width, false: descrease width
	 *  @param  {number} [factor=50] added/subtracted number of pixels when zoom in/out 
	 */
	resize: function(zoom) {
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
 *  Collection of Bloc.
 *  @type {Backbone.Collection}
 */
var Grid = Backbone.Collection.extend({

	/**
	 *  Associated model.
	 *  @type {Backbone.Model}
	 */
	model: Bloc,
	
	/** @constructs */
	initialize : function() {
		// useful variables for notes selection
		this.gridWin = $(".grid-win");
		this.gridWinDim = {
			left: this.gridWin.offset().left, 
			top: this.gridWin.offset().top, 
			width: this.gridWin.width(), 
			height: this.gridWin.height()
		};
		this.startLeft = 0;
		this.endLeft = 0;
	},

	/**
	 *  Find the first (should be the only) Bloc with corresponding order.
	 *  @param  {number} order Bloc order
	 *  @return {Backbone.Model}       Model corresponding to the selected Bloc
	 */
	getBloc: function(order) {
		return this.find(function(bloc) {
			return bloc.get("order") == order;
		});
	},

	/**
	 *  Calculate order of a new Bloc.
	 *  @return {number} number of the last Bloc + 1
	 */
	nextOrder: function() {
		if (!this.length) return 1;
		return this.last().get("order") + 1;
	},

	/**
	 *  Toggle note in the range delimited by the arguments, on the same pitch as start note.
	 *  @param  {number} start left position of mousedown event
	 *  @param  {number} end   left position of mouseup event
	 */
	selectRange: function(pitch, start, end, user) {
		var gridWin = this.gridWin,
			gridWinDim = this.gridWinDim;

		var selectedNote = [];
		var selectables	= gridWin.find(".bloc").children(".editable").children(".p-"+pitch).children();

		selectables.each(function () {
			var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
			var thisWidth = $(this).width();
			var thisId = $(this).attr("id");

			// out of range => leave alone
			if (((end >= start) && ((thisLeft > end) || (thisLeft+thisWidth < start)))
				|| ((end <= start) && ((thisLeft+thisWidth < end) || (thisLeft > start))))
				return;

			// already on => cancel selection
			if ($(this).hasClass("on")) {
				alert("Pas de superposition de notes!");
				selectedNote = [];
				return false;
			};

			// into the range => select
			if (((end >= start) && (thisLeft <= end) && (thisLeft+thisWidth > start))
				|| ((end <= start) && (thisLeft+thisWidth > end) && (thisLeft <= start)))
				selectedNote.push(thisId);
		});

		// toggle selected
		for (var i = 0; i<selectedNote.length; i++) {
			var id = selectedNote[i];			
			var order = id.split("-")[0],
				sub = id.split("-")[1];
			
			this.getBloc(order).layers.getSub(sub).toggleNote(id, user);
		};
	}
});


/**
 *  VIEWS
 */

/**
 *  Associated View to Layer Model.
 *  @type {Backbone.View}
 */
var LayerView = Backbone.View.extend({

	/**
	 *  Class attribute of the div associated to the View.
	 *  @type {String}
	 */
	className: "layer",

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"mousedown .note" : "startingNote",
		"mousemove .note" : "movingNote",
		"mouseup .note" : "endingNote"
	},

	/** @constructs */
	initialize: function() {
		// function that render Underscore templating
		this.layerTemplate = _.template($("#layer-template").html());

		// Bound events
		this.model.on("change:noteOn", this.toggleNote);
	},

	/**
	 *  Render the View of a Layer.
	 *  @return {Backbone.View} self View to enable chained calls
	 */
	render: function() {
		var layer = this.model;
		$(this.el)
			.html(this.layerTemplate({
				bloc: layer.get("bloc"),
				sub: layer.get("sub"),
				noteOn: layer.get("noteOn"),
				pitches: pitches
			}))
			.addClass('sub-'+layer.get("sub"))
			.addClass("editable");

		return this;
	},

	/**
	 *  Toogle the "on" class on the selected note div.
	 *  @param  {String} noteId ID of the selected note
	 */
	toggleNote: function(noteId, user) {
		var el = $('#'+noteId);
		var userClass = 'user-'+user;
		var curClass = el.attr("class").match("user-[^ ]*");
				
		if (curClass)
			el.removeClass(curClass[0]);
		
		el.toggleClass("on");
		
		if (el.hasClass("on"))
			el.addClass(userClass);
	},

	/**
	 *  Initialize selection variables on mousedown.
	 *  @param  {object} e event object fired
	 */
	startingNote: function(e) {
		var gridWin = editor.grid.gridWin,
			gridWinDim = editor.grid.gridWinDim;
		var id = startNoteId = e.target.id;

		// 0: Bloc, 1: Layer, 2: Pitch, 3: Note
		var idArray = id.split("-");
		startNote = {
			"bloc":  idArray[0],
			"layer":  idArray[1],
			"note":  idArray[3],
		};
		pitch = idArray[2];

		startLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;

		/* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING NOTE */
		// editor.editorView.onSelection = true;

		e.preventDefault();
	},

	/**
	 *  Scroll grid according to mouse position.
	 *  @param  {object} e event object fired
	 */
	movingNote: function(e) {
		var gridWin = editor.grid.gridWin,
			gridWinDim = editor.grid.gridWinDim;

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

		/* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING NOTE */
		/*
		var startLeft = editor.editorView.startLeft,
			pitch = editor.pitch;
		var currentLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;
	
		// Selecting
		if (editor.editorView.onSelection) {
			var selectables	= gridWin.find(".bloc").children(".editable").children(".p-"+pitch).children();
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
	 *  Toggle one note or a whole range of notes. 
	 *  @param  {object} e event object fired
	 */
	endingNote: function(e) {
		var gridWin = editor.grid.gridWin,
			gridWinDim = editor.grid.gridWinDim;
		var id = endNoteId = e.target.id,
			user = jasmed.user;
		endLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;

		// 0: Bloc, 1: Layer, 2: Pitch, 3: Note
		var idArray = id.split("-");
		endNote = {
			bloc :  idArray[0],
			layer :  idArray[1],
			note :  idArray[3],
		};

		// send to communication
		editor.publish('selectionToServer', {
			pitch : pitch,
			startNote : startNote,
			endNote : endNote,
			user: user
		});

		// toggle notes
		editor.grid.selectRange(pitch, startLeft, endLeft, user);

		/* MULTI DRAG REALTIME SELECTION BUT NOT FOLLOWING MOUSE REVERSE OR TOGGLING NOTE */
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
	el: ".bloc",

	/** @constructs */
	initialize: function() {
		// Bound events
		this.collection.on("add", this.addLayer, this);
		this.collection.on("change:editable", this.switchEdit, this);
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

		// insert in the DOM the rendered View
		$('.b-'+this.bloc.get("order")).append(layerView.render().el);
	},

	/**
	 *  Manipulate the DOM to get the correct Layer editable.
	 *  @param  {Backbone.Model} layer Layer to edit
	 */
	switchEdit: function(layer) {
		var blocOrder = '.b-'+this.bloc.get("order");

		$(blocOrder+' .editable').removeClass("editable");

		if (layer.get("editable")) {
			// TODO: find a cleaner way
			$(blocOrder+' .sub-'+layer.get("sub")).addClass("editable").appendTo(blocOrder);
		};
	}

});

/**
 *  Associated View to Bloc Model
 *  @type {Backbone.View}
 */
var BlocView = Backbone.View.extend({

	/**
	 *  Class attribute of the div associated to the View.
	 *  @type {String}
	 */
	className: "bloc-layer-info",

	/** @constructs */
	initialize: function() {
		this.grid = this.model.collection;

		// function that render Underscore templating
		this.layerInfoTemplate = _.template($("#layer-info-template").html());

		// correct gridWinDim.top
		this.grid.gridWinDim.top = this.grid.gridWin.offset().top;

		// Bound events
		this.model.on("change:width", this.resize, this);
		this.model.layers.on("change add", this.actualize, this);
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"keypress .add-layer" : "newLayerOnEnter",
		"click .edit-layer" : "editLayer"
	},

	/**
	 *  Render the View of a Bloc.
	 *  @return {Backbone.View} self View to enable chained calls
	 */
	render: function() {
		var bloc = this.model;
		$(this.el)
			.html(this.layerInfoTemplate({ 
				layers: bloc.layers.models
			}))
			.addClass('bli-'+bloc.get("order"))
			.css({"width" : bloc.refWidth+'px'});

		return this;
	},

	/**
	 *  Set the new width of the Bloc
	 *  @param  {number} width new width in pixel
	 */
	resize: function(bloc) {
		var order = this.model.get("order"),
			width = this.model.get("width");

		$(".b-"+order).css({"width" : width+'px'});
		$(this.el).css({"width" : width+'px'});
	},

	/**
	 *  Actualize the View
	 */
	actualize: function() {
		$(this.el).html(this.layerInfoTemplate({
			layers: this.model.layers.models
		}));

		// correct gridWinDim.top
		this.grid.gridWinDim.top = this.grid.gridWin.offset().top;
	},

	/**
	 *  Create new Layer according to the input value
	 *  @param  {object} e event object fired
	 */
	newLayerOnEnter: function(e) {
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
				sub: sub,
				bloc: this.model.get("order")
			});
		}
		input.val("");

		// adapt bloc width according to subdivisions of the layer
		this.model.resize(true, 0);
	},

	/**
	 *  Set a Layer editable, disable old editable Layer.
	 *  @param  {object|number} e event object or sub number
	 */
	editLayer: function(e) {
		var layers = this.model.layers;
		var sub = typeof(e)=="object" ? e.target.innerHTML : e;

		// if Layer to set isn't already editable
		if (layers.editable() !== layers.getSub(sub)) {
			layers.editable().toggleEdit();
			layers.getSub(sub).toggleEdit();
		};

		// adapt bloc width according to subdivisions of the layer
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
	el: ".editor",

	/** @constructs */
	initialize: function() {
		// Bound events
		this.collection.on("add", this.addBloc);
		this.collection.gridWin.on("scroll", this.syncScroll);
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
	},

	/**
	 *  Insert in the DOM the added Bloc to grid collection.
	 *  @param {Backbone.Model} bloc newly added Bloc
	 */
	addBloc: function(bloc) {
		// create a View for the Bloc
		var blocView = new BlocView({
			model: bloc
		});

		// insert in the DOM the rendered View
		$(".layer-info").append(blocView.render().el);

		// adapt bloc width according to subdivisions of the layer
		blocView.model.resize(true, 0);
	},

	/**
	 *  Add a new Bloc to the Grid collection.
	 */
	newBloc: function() {
		var width = this.collection.last().refWidth;
		this.collection.add({
			width: width
		});

		// send to communication
		editor.publish("newBlocToServer");
	},

	/**
	 *  Synchronize scrolling between the grid, piano and layer-info window
	 *  @param  {object} e event object fired
	 */
	syncScroll: function(e) {
		$(".piano-win").scrollTop(e.target.scrollTop);
    	$(".layer-info-win").scrollLeft(e.target.scrollLeft);
	},

	/**
	 *  Zoom in ou out in the Grid
	 *  @param  {boolean} zoom true: zoom in, false: zoom out
	 */
	zoom: function(zoom) {
		_.map(this.collection.models, function(bloc) {
			if (!zoom && (bloc.get("width") <= minBlocWidth)) 
				return false;
			
			bloc.resize(zoom);
		});

		// correct gridWinDim.top
		this.collection.gridWinDim.top = this.collection.gridWin.offset().top;
	}

});


/**
 *  INITIALIZATION
 */

/**
 *  Module initialization method
 */
editor.initialize = function() {
	editor.grid = new Grid();

	editor.editorView = new EditorView({ 
		collection : editor.grid 
	});

	// Add 2 Blocs to begin
	editor.grid.add();
	editor.grid.add();

	// for (var i = 0; i < 32; i++) {
	// 	editor.grid.add();
	// };
};

})(jasmed.module("editor"));
