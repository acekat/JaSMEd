var jasmed = {

	// Create/Get module
	module: _.memoize(function(name) {
		return jasmed.module[name] || {};	
	})
};


// Treat this as the single entry point into the application.
$(function() {

	var editor = jasmed.module("editor");

	new editor.Router();

	// DRAG TO SELECT EXAMPLE
	// $(".grid").dragToSelect({
	// 	selectedClass: "on",
	// 	selectables: "div.note",
	// 	selectOnMove: true,
	// 	autoScroll: true,
	// });

});