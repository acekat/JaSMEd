// Module reference argument, assigned at the bottom
(function(Editor) {

	// Dependencies

	/*
	 *	MODELS & COLLECTIONS
	 */
	// Layer
	Editor.Layer = Backbone.Model.extend({

		defaults : {
			sub: 4,
			pitches: ['do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'sib4', 'si4',
						'do5', 'do#5', 're5', 're#5', 'mi5', 'fa5', 'fa#5', 'sol5', 'sol#5', 'la5', 'sib5', 'si5'],
			editable: true
		},

		initialize : function() {
		},

		toggleEdit: function() {			
			this.set({ "editable" : !this.get("editable")});
		}

	});

	// Layers
	Editor.Layers = Backbone.Collection.extend({

		model: Editor.Layer,
		
		initialize : function() {
		},

		editable: function() {
			return this.find(function(layer) { 
				return layer.get('editable'); 
			});
		},

		getSub: function(sub) {
			return this.find(function(layer) {
				return (layer.get('sub') == sub);
			})
		}

	});

	// Bloc
	Editor.Bloc = Backbone.Model.extend({

		defaults : function() {
			return {
				order: Editor.grid.nextOrder()
			}
		},

		initialize : function() {
			$('.add-bloc').before('<div class="bloc b-'+this.get("order")+'"></div>');
			
			this.layers = new Editor.Layers();
			this.layersView = new Editor.LayersView({
				collection: this.layers,
				model: this
			});
			this.layers.add();
		}

	});

	// Grid
	Editor.Grid = Backbone.Collection.extend({

		model: Editor.Bloc,
		
		initialize : function() {
		},

		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		}
	});


	/*
	 *	VIEWS
	 */
	// Layer
	Editor.LayerView = Backbone.View.extend({

		className: 'layer',

		initialize: function() {
			this.layerTemplate = _.template($('#layer-template').html());
		},

		render: function() {
			var layer = this.model;
			$(this.el)
				.html(this.layerTemplate(layer.toJSON()))
				.addClass('sub-'+layer.get('sub'))

			return this;
		}
	});

	// Layers
	Editor.LayersView = Backbone.View.extend({

		el: '.bloc',

		initialize: function() {
			this.collection.on('add', this.addLayer, this);
			this.collection.on('change:editable', this.switchEdit, this);
		},

		addLayer: function(layer) {
			var layerView = new Editor.LayerView({
				model: layer
			});

			$('.b-'+this.model.get('order')).append(layerView.render().el);
		},

		switchEdit: function(layer) {
			if (layer.get('editable')) {
				// TODO: find a cleaner way
				$('.b-'+this.model.get('order')+' .sub-'+layer.get('sub')).appendTo('.b-'+this.model.get('order'));
			};
		}

	});

	// Bloc
	Editor.BlocView = Backbone.View.extend({

		className: 'bloc-layer-info',

		initialize: function() {
			this.layerInfoTemplate = _.template($('#layer-info-template').html());

			this.model.layers.on('all', this.actualize, this);
		},

		events: {
			"keypress .add-layer" : "newLayerOnEnter",
			"click .edit-layer" : "editLayer"
		},

		render: function() {
			var bloc = this.model;
			$(this.el)
				.html(this.layerInfoTemplate({ 
					layers: bloc.layers.models
				}))
				.addClass('bli-'+bloc.get('order'));

			return this;
		},

		actualize: function() {
			$(this.el).html(this.layerInfoTemplate({ 
				layers: this.model.layers.models
			}));
		},

		newLayerOnEnter: function(e) {
			var layers = this.model.layers;
			var input = this.$('.add-layer');
			var text = input.val();
			var sub, layer;

			if (!text || e.keyCode != 13) return;
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
				});
			}
			input.val('');
		},

		editLayer: function(e) {
			var layers = this.model.layers;
			var sub = typeof(e)=='object' ? e.target.innerHTML : e;

			if (layers.editable() !== layers.getSub(sub)) {
				layers.editable().toggleEdit();
				layers.getSub(sub).toggleEdit();
			};
		}

	});

	// Editor
	Editor.EditorView = Backbone.View.extend({

		el: '.editor',

		initialize: function() {
			this.collection.on('add', this.addBloc);
		},

		events: {
			"click .add-bloc" : "newBloc"
		},

		addBloc: function(bloc) {
			var blocView = new Editor.BlocView({
				model: bloc
			});
			$(".layer-info").append(blocView.render().el);
		},

		newBloc: function(e) {
			this.collection.add();
		}

	});


	/*
	 *	ROUTER
	 */
	Editor.Router = Backbone.Router.extend({

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