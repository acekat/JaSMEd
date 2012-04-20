var jasmed = {

	// Create/Get module
	module: _.memoize(function(name) {
		return jasmed.module[name] || {};	
	})
}


// Treat this as the single entry point into the application.
$(function() {

	var Editor = jasmed.module("editor");

	new Editor.Router();

});