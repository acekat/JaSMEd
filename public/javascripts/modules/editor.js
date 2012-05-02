// Module reference argument, assigned at the bottom
(function(editor) {

// Dependencies


// calls toggleNote upon reception of 'noteToggled' msg
editor.subscribe('noteToggled', function(range) {
	var pitch = range.pitch,
		startNote = range.startNote,
		endNote = range.endNote;

	editor.pitch = range.pitch;
});

editor.subscribe('loginSync', function(login) {
	editor.user = login;
});

/**
 *  Layer represent a single layer in a bloc.
 *  @type {Backbone.Model}
 */
editor.Layer = Backbone.Model.extend({

	/**
	 *  Default values of a Layer variables.
	 *  @type {Object}
	 */
	defaults : {
		sub: 4,
		pitches: ['do3', 'do#3', 're3', 're#3', 'mi3', 'fa3', 'fa#3', 'sol3', 'sol#3', 'la3', 'la#3', 'si3',
					'do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'la#4', 'si4'],
		noteOn: [],
		editable: true
	},

	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Toggle <tt>editable</tt> variable
	 */
	toggleEdit: function() {			
		this.set({ "editable" : !this.get("editable")});
	},

	/**
	 *  Add/Remove <tt>noteId</tt> to/from the <tt>noteOn</tt> array.
	 *  @param  {String} noteId HTML id of the case to turn on/off
	 */
	toggleNote: function(noteId) {
		var noteOn = this.get("noteOn")
		var index = _.indexOf(noteOn, noteId);

		if (index === -1) 
			// turn note on
			noteOn.push(noteId)
		else
			// turn note off
			noteOn.splice(index, 1);

		// trigger the change event on noteOn array with noteId argument
		this.trigger("change:noteOn", noteId);
	}

});

/**
 *  Collection of Layer.
 *  @type {Backbone.Collection}
 */
editor.Layers = Backbone.Collection.extend({

	/**
	 *  Associated model.
	 *  @type {Backbone.Model}
	 */
	model: editor.Layer,
	
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
			return (layer.get("sub") == sub);
		})
	}

});

/**
 *  Bloc contains a collection of Layer (Layers).
 *  Bloc is an element of the Grid.
 *  @type {Backbone.Model}
 */
editor.Bloc = Backbone.Model.extend({

	/**
	 *  Default values of a Bloc variables.
	 *  @return {object} key:value description of variables
	 */
	defaults : function() {
		return {
			order: editor.grid.nextOrder()
		}
	},

	/** @constructs */
	initialize : function() {
		// add new Bloc "anchor" to DOM
		$(".add-bloc").before('<div class="bloc b-'+this.get("order")+'"></div>');
		
		// create new Layers and associated View
		this.layers = new editor.Layers();
		this.layersView = new editor.LayersView({
			collection: this.layers,
			model: this
		});

		// add a first new Layer
		this.layers.add({
			bloc: this.get("order")
		});
	}

});

/**
 *  Collection of Bloc.
 *  @type {Backbone.Collection}
 */
editor.Grid = Backbone.Collection.extend({

	/**
	 *  Associated model.
	 *  @type {Backbone.Model}
	 */
	model: editor.Bloc,
	
	/** @constructs */
	initialize : function() {
	},

	/**
	 *  Calculate order of a new Bloc.
	 *  @return {number} number of the last Bloc + 1
	 */
	nextOrder: function() {
		if (!this.length) return 1;
		return this.last().get("order") + 1;
	}
});

/**
 *  Associated View to Layer Model.
 *  @type {Backbone.View}
 */
editor.LayerView = Backbone.View.extend({

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
			.html(this.layerTemplate(layer.toJSON()))
			.addClass('sub-'+layer.get("sub"))
			.addClass("editable");

		return this;
	},

	/**
	 *  Toogle the "on" class on the selected note div.
	 *  @param  {String} noteId ID of the selected note
	 */
	toggleNote: function(noteId) {
		var el = $('#'+noteId);
		var userClass = 'user-' + editor.user;
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
		var gridWin = editor.editorView.gridWin,
			gridWinDim = editor.editorView.gridWinDim;
		var id = editor.startNoteId = e.target.id;

		// 0: Bloc, 1: Layer, 2: Pitch, 3: Note
		var idArray = id.split("-");
		editor.startNote = {
			"bloc":  idArray[0],
			"layer":  idArray[1],
			"note":  idArray[3],
		};
		editor.pitch = idArray[2];

		editor.editorView.startLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;

		// editor.editorView.onSelection = true;

		e.preventDefault();
	},

	/**
	 *  Scroll grid according to mouse position.
	 *  @param  {object} e event object fired
	 */
	movingNote: function(e) {
		var gridWin = editor.editorView.gridWin,
			gridWinDim = editor.editorView.gridWinDim;
		var scrollMargin = 15;

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
		var gridWin = editor.editorView.gridWin,
			gridWinDim = editor.editorView.gridWinDim,
			startLeft = editor.editorView.startLeft;
		var id = editor.endNoteId = e.target.id;
		var endLeft = editor.editorView.endLeft = e.pageX - gridWinDim.left + gridWin[0].scrollLeft;

		// 0: Bloc, 1: Layer, 2: Pitch, 3: Note
		var idArray = id.split("-");
		editor.endNote = {
			bloc :  idArray[0],
			layer :  idArray[1],
			note :  idArray[3],
		};

		// send to communication
		editor.publish('toggleNote', {
			pitch : editor.pitch,
			startNote : editor.startNote,
			endNote : editor.endNote
		});

		// local toggle
		// one note selected
		if (id === editor.startNoteId) {
			this.model.toggleNote(id);
		}
		// a range of notes
		else
			this.selectRange(startLeft, endLeft);

		// console.log(editor.pitch+" : "+JSON.stringify(editor.startNote)+" : "+JSON.stringify(editor.endNote));

		// editor.editorView.onSelection = false;

		e.preventDefault();
	},

	/**
	 *  Toggle note in the range delimited by the arguments, on the same pitch as start note.
	 *  @param  {number} start left position of mousedown event
	 *  @param  {number} end   left position of mouseup event
	 */
	selectRange: function(start, end) {
		var model = this.model;
		var gridWin = editor.editorView.gridWin,
			gridWinDim = editor.editorView.gridWinDim,
			pitch = editor.pitch;

		var selectedNote = [];
		var selectables	= gridWin.find(".bloc").children(".editable").children(".p-"+pitch).children();
		// Optimized but can be buggy
		// var selectables	= $(this.el).children(".p-"+pitch).children();

		selectables.each(function () {
			var thisLeft = $(this).offset().left - gridWinDim.left + gridWin[0].scrollLeft;
			var thisWidth = $(this).width();
			var thisId = $(this).attr("id");

			// out of range => leave alone
			if (((end > start) && ((thisLeft > end) || (thisLeft+thisWidth < start)))
				|| ((end < start) && ((thisLeft+thisWidth < end) || (thisLeft > start))))
				return;

			// already on => cancel selection
			if ($(this).hasClass("on")) {
				alert("C'est quoi les bails? Tu superposes les notes?\nT'es ouf ma gueule!");
				selectedNote = [];
				return false;
			};

			// into the range => select
			if (((end > start) && (thisLeft < end) && (thisLeft+thisWidth > start))
				|| ((end < start) && (thisLeft+thisWidth > end) && (thisLeft < start)))
				selectedNote.push(thisId);
		});

		// toggle selected
		for (var i = 0; i<selectedNote.length; i++) {
			console.log(model);
			model.toggleNote(selectedNote[i]);
		};
	}


	/* SHIFT + CLICK TEST */
	/*
	selectedNote: function(e) {
		// 0: Bloc, 1: Layer, 2: Pitch, 3: Note
		var IdArray = e.target.id.split("-");

		if (!jQuery.isEmptyObject(editor.endNote))
			editor.startNote = editor.endNote = {};

		if (e.shiftKey) {
			if (jQuery.isEmptyObject(editor.startNote)) {
				fillNote(editor.startNote, IdArray);
				editor.pitch = IdArray[2];
			} else {
				if (editor.pitch === IdArray[2]) {
					fillNote(editor.endNote, IdArray);
					this.selectRange(editor.startNote, editor.endNote);
				} else {
					editor.startNote = {};
				};
			};
		} else {
			editor.pitch = IdArray[2];
			fillNote(editor.startNote, IdArray);
			fillNote(editor.endNote, IdArray);
			this.model.toggleNote(e.target.id);
		};
	},

	selectRange: function(start, end) {

	}
	*/

});

/**
 *  Associated View to Layers Collection.
 *  @type {Backbone.view}
 */
editor.LayersView = Backbone.View.extend({

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

		// console.log(this.collection);
	},

	/**
	 *  Insert in the DOM the added Layer to Layers collection.
	 *  @param {Backbone.Model} layer newly added Layer
	 */
	addLayer: function(layer) {
		// create a View for the Layer
		var layerView = new editor.LayerView({
			model: layer
		});

		// insert in the DOM the rendered View
		$('.b-'+this.model.get("order")).append(layerView.render().el);
	},

	/**
	 *  Manipulate the DOM to get the correct Layer editable.
	 *  @param  {Backbone.Model} layer Layer to edit
	 */
	switchEdit: function(layer) {
		var blocOrder = '.b-'+this.model.get("order");

		$(blocOrder+' .editable').removeClass("editable");

		if (layer.get("editable")) {
			// TODO: find a cleaner way
			$(blocOrder+' .sub-'+layer.get("sub")).appendTo(blocOrder).addClass("editable");
		};
	}

});

/**
 *  Associated View to Bloc Model
 *  @type {Backbone.View}
 */
editor.BlocView = Backbone.View.extend({

	/**
	 *  Class attribute of the div associated to the View.
	 *  @type {String}
	 */
	className: "bloc-layer-info",

	/** @constructs */
	initialize: function() {
		// function that render Underscore templating
		this.layerInfoTemplate = _.template($("#layer-info-template").html());

		// correct gridWinDim.top
		editor.editorView.gridWinDim.top = editor.editorView.gridWin.offset().top;

		// Bound events
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
			.addClass('bli-'+bloc.get("order"));

		return this;
	},

	/**
	 *  Actualize the View
	 */
	actualize: function() {
		$(this.el).html(this.layerInfoTemplate({ 
			layers: this.model.layers.models
		}));

		// correct gridWinDim.top
		editor.editorView.gridWinDim.top = editor.editorView.gridWin.offset().top;
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
	}

});

/**
 *  Associated View to editor Module (Grid Collection).
 *  @type {Backbone.View}
 */
editor.EditorView = Backbone.View.extend({

	/**
	 *  div associated to the View.
	 *  @type {String}
	 */
	el: ".editor",

	/** @constructs */
	initialize: function() {
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

		// Bound events
		this.collection.on("add", this.addBloc);
		this.gridWin.on("scroll", this.syncScroll);

		// console.log(this.collection);
	},

	/**
	 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
	 *  @type {Object}
	 */
	events: {
		"click .add-bloc" : "newBloc"
	},

	/**
	 *  Insert in the DOM the added Bloc to grid collection.
	 *  @param {Backbone.Model} bloc newly added Bloc
	 */
	addBloc: function(bloc) {
		// create a View for the Bloc
		var blocView = new editor.BlocView({
			model: bloc
		});

		// insert in the DOM the rendered View
		$(".layer-info").append(blocView.render().el);
	},

	/**
	 *  Add a new Bloc to the Grid collection.
	 */
	newBloc: function() {
		this.collection.add();
	},

	/**
	 *  Synchronize scrolling between the grid, piano and layer-info window
	 *  @param  {object} e event object fired
	 */
	syncScroll: function(e) {
		$(".piano-win").scrollTop(e.target.scrollTop);
    	$(".layer-info-win").scrollLeft(e.target.scrollLeft);
	}

});


/**
 *  Only module Route to initialize the module.
 *  @type {Backbone.Router}
 */
editor.Router = Backbone.Router.extend({

	/** @constructs */
	initialize: function() {
		editor.grid = new editor.Grid();

		editor.editorView = new editor.EditorView({ 
			collection : editor.grid 
		});

		// Add 2 Blocs to begin
		editor.grid.add();
		editor.grid.add();

		// for (var i = 0; i < 32; i++) {
		// 	editor.grid.add();
		// };
	}

});

})(jasmed.module("editor"));