// Module reference argument, assigned at the bottom
(function(Editor) {

	// Dependencies

	/**
	 *  Layer represent a single layer in a bloc.
	 *  @type {Backbone.Model}
	 */
	Editor.Layer = Backbone.Model.extend({

		/**
		 *  Default values of a Layer variables.
		 *  @type {Object}
		 */
		defaults : {
			sub: 4,
			pitches: ['do3', 'do#3', 're3', 're#3', 'mi3', 'fa3', 'fa#3', 'sol3', 'sol#3', 'la3', 'la#3', 'si3',
						'do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'la#4', 'si4'],
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
		}

	});

	/**
	 *  Collection of Layer.
	 *  @type {Backbone.Collection}
	 */
	Editor.Layers = Backbone.Collection.extend({

		/**
		 *  Associated model.
		 *  @type {Backbone.Model}
		 */
		model: Editor.Layer,
		
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
	Editor.Bloc = Backbone.Model.extend({

		/**
		 *  Default values of a Bloc variables.
		 *  @return {object} key:value description of variables
		 */
		defaults : function() {
			return {
				order: Editor.grid.nextOrder()
			}
		},

		/** @constructs */
		initialize : function() {
			// add new Bloc "anchor" to DOM
			$(".add-bloc").before('<div class="bloc b-'+this.get("order")+'"></div>');
			
			// create new Layers and associated View
			this.layers = new Editor.Layers();
			this.layersView = new Editor.LayersView({
				collection: this.layers,
				model: this
			});

			// add a first new Layer
			this.layers.add();
		}

	});

	/**
	 *  Collection of Bloc.
	 *  @type {Backbone.Collection}
	 */
	Editor.Grid = Backbone.Collection.extend({

		/**
		 *  Associated model.
		 *  @type {Backbone.Model}
		 */
		model: Editor.Bloc,
		
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
	Editor.LayerView = Backbone.View.extend({

		/**
		 *  Class attribute of the div associated to the View.
		 *  @type {String}
		 */
		className: "layer",

		/** @constructs */
		initialize: function() {
			// function that render Underscore templating
			this.layerTemplate = _.template($("#layer-template").html());
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

			return this;
		}
	});

	/**
	 *  Associated View to Layers Collection.
	 *  @type {Backbone.view}
	 */
	Editor.LayersView = Backbone.View.extend({

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
			var layerView = new Editor.LayerView({
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
			if (layer.get("editable")) {
				// TODO: find a cleaner way
				$('.b-'+this.model.get("order")+' .sub-'+layer.get("sub")).appendTo('.b-'+this.model.get("order"));
			};
		}

	});

	/**
	 *  Associated View to Bloc Model
	 *  @type {Backbone.View}
	 */
	Editor.BlocView = Backbone.View.extend({

		/**
		 *  Class attribute of the div associated to the View.
		 *  @type {String}
		 */
		className: "bloc-layer-info",

		/** @constructs */
		initialize: function() {
			// function that render Underscore templating
			this.layerInfoTemplate = _.template($("#layer-info-template").html());

			// Bound events
			this.model.layers.on("all", this.actualize, this);
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
					sub: sub
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
	 *  Associated View to Editor Module (Grid Collection).
	 *  @type {Backbone.View}
	 */
	Editor.EditorView = Backbone.View.extend({

		/**
		 *  div associated to the View.
		 *  @type {String}
		 */
		el: ".grid-win",

		/** @constructs */
		initialize: function() {
			// Bound events
			this.collection.on("add", this.addBloc);
		},

		/**
		 *  Delegated events: uses jQuery's delegate function to provide declarative callbacks for DOM events. 
		 *  @type {Object}
		 */
		events: {
			"click .add-bloc" : "newBloc",
			"scroll" : "syncScroll"
		},

		/**
		 *  Insert in the DOM the added Bloc to grid collection.
		 *  @param {Backbone.Model} bloc newly added Bloc
		 */
		addBloc: function(bloc) {
			// create a View for the Bloc
			var blocView = new Editor.BlocView({
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
	Editor.Router = Backbone.Router.extend({

		/** @constructs */
		initialize: function() {
			Editor.grid = new Editor.Grid();

			Editor.editorView = new Editor.EditorView({ 
				collection : Editor.grid 
			});

			// Add 2 Blocs to begin
			Editor.grid.add();
			Editor.grid.add();

			// for (var i = 0; i < 32; i++) {
			// 	Editor.grid.add();
			// };
		}

	});

})(jasmed.module("editor"));