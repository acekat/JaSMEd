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
			displayed: true
		},

		initialize : function() {
			// console.log('New Layer');
		},

		toggleDisplay: function() {
			displayed: !this.get("displayed");
		}

	});

	// Layers
	Editor.Layers = Backbone.Collection.extend({

		model: Editor.Layer,
		
		initialize : function() {
			// console.log('New Layers');
		},

		displayed: function() {
			return this.filter(function(layer){ return layer.get('displayed'); });
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
			// console.log('New Bloc');
			$('.add-bloc').before('<div class="bloc b-'+this.get("order")+'"></div>');
			
			this.layers = new Editor.Layers();
			
			/* DEBUG */
			// console.log('Bloc ('+this.cid+') layers');
			// console.log(this.layers);
			/* DEBUG */

			this.layersView = new Editor.LayersView({
				collection: this.layers,
				model: this
			});
			this.layers.add(new Editor.Layer());
		},

	});

	// Grid
	Editor.Grid = Backbone.Collection.extend({

		model: Editor.Bloc,
		
		initialize : function() {
			// console.log('New Blocs');
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
			// console.log('New Layer View');
		},

		render: function() {
			var layer = this.model;
			var layerTemplate = _.template($('#layer-template').html());

			$(this.el)
				.html(layerTemplate(layer.toJSON()))
				.addClass('sub-'+layer.get('sub'))

			return this;
		}
	});

	// Layers
	Editor.LayersView = Backbone.View.extend({

		el: '.bloc',

		initialize: function() {
			// console.log('New Layers View');

			this.collection.on('add', this.addLayer, this);
		},

		addLayer: function(layer) {
			var layerView = new Editor.LayerView({
				model: layer
			});

			$('.b-'+this.model.get('order')).prepend(layerView.render().el);
		}

	});

	// Bloc
	Editor.BlocView = Backbone.View.extend({

		className: 'bloc-layer-info',

		initialize: function() {
			// console.log('New Bloc View');
		},

		events: {
			"click .add-layer" : "newLayer"
		},

		render: function() {
			var bloc = this.model;
			var layerInfoTemplate = _.template($('#layer-info-template').html());
			$(this.el)
				.html(layerInfoTemplate({ 
					layers: bloc.layers.models,
					order: bloc.get("order")
				}))
				.addClass('bli-'+bloc.get('order'));

			// console.log('Bloc Displayed');
			return this;
		},

		newLayer: function(e) {
			var layer = new Editor.Layer();
			this.model.layers.add(layer);

			/* DEBUG */
			// console.log('LayersView collection: ');
			// console.log(this.model.layers);
			/* DEBUG */
		}

	});

	// Editor
	Editor.EditorView = Backbone.View.extend({

		el: '.editor',

		initialize: function() {
			// console.log('New Editor View');

			this.collection.on('add', this.addBloc, this);
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
			var bloc = new Editor.Bloc();
			this.collection.add(bloc);
		}

	});


	/*
	 *	ROUTER
	 */
	Editor.Router = Backbone.Router.extend({

		initialize: function() {
			// console.log('Grid creation...');
			Editor.grid = new Editor.Grid();

			// console.log('GridView creation...');
			Editor.editorView = new Editor.EditorView({ 
				collection : Editor.grid 
			});

			// Add 2 Blocs to begin
			Editor.grid.add(new Editor.Bloc());
			Editor.grid.add(new Editor.Bloc());
		}

	});

})(jasmed.module("editor"));