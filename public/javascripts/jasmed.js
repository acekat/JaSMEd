var jasmed = {

	// Create/Get module
	module: _.memoize(function(name) {
		return jasmed.module[name] || {};	
	})
}


// Treat this as the single entry point into the application.
$(function() {

	var GridApp = jasmed.module("grid");

	// // Create the root application Router
	// var Router = Backbone.Router.extend({
	// 	initialize: function() {
			console.log('Grid creation...');
			GridApp.grid = new GridApp.Blocs();

			console.log('GridView creation...');
			GridApp.gridView = new GridApp.GridView({ collection : GridApp.grid });

			GridApp.grid.add(new GridApp.Bloc());
	// 	}
	// });

	// // Initialize it into the application namespace
	// new Router();
});