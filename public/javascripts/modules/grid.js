// src/modules/grid.js
// Module reference argument, assigned at the bottom
(function(Grid) {

	// Dependencies

	// Model: Bloc
	Grid.Bloc = Backbone.Model.extend({

		defaults : function() {
			return {
				sub: 4,
				pitches: ['do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'sib4', 'si4',
							'do5', 'do#5', 're5', 're#5', 'mi5', 'fa5', 'fa#5', 'sol5', 'sol#5', 'la5', 'sib5', 'si5'],
				order: Grid.grid.nextOrder()
			}
		},

		initialize : function() {
			console.log('New Bloc');
		}

	});

	// Collection: Blocs
	Grid.Blocs = Backbone.Collection.extend({

		model: Grid.Bloc,
		
		initialize : function() {
			console.log('New Blocs');
		},

		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		}
	});

	// View: Bloc
	Grid.BlocView = Backbone.View.extend({

		className: 'bar-container',

		initialize: function() {
			console.log('New Bloc View');
		},

		render: function() {
			var bloc = this.model;
			var blocTemplate = _.template($('#bloc-template').html());
			$(this.el)
				.html(blocTemplate(bloc.toJSON()))
				.addClass('sub-'+bloc.get('sub'))
				.addClass('bc-'+bloc.get('order'));

			console.log('Bloc Displayed');
			return this;
		}
	});


	// View: Grid
	Grid.GridView = Backbone.View.extend({

		el: '.grid-layer',

		initialize: function() {
			console.log('New Grid View');

			this.collection.on('add', this.addOne);
		},

		events: {
			// Double-click on the grid to add new Bloc 
			"dblclick" : "addBloc"
		},

		addOne: function(bloc) {
			var blocView = new Grid.BlocView({
				model: bloc
			});
			$('.grid-layer').append(blocView.render().el);
		},

		addBloc: function(e) {
			Grid.grid.add(new Grid.Bloc());
		}

	});

	// Router
	Router = Backbone.Router.extend({
		initialize: function() {
			console.log('Grid creation...');
			Grid.grid = new Grid.Blocs();

			console.log('GridView creation...');
			Grid.gridView = new Grid.GridView({ collection : Grid.grid });

			Grid.grid.add(new Grid.Bloc());
		}
	});

})(jasmed.module("grid"));