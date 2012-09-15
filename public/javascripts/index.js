var $ = require('jquery');

// Single entry point into the application.
$(function() {
	var path = window.location.pathname;
	//var storePath = (path === 'app') ? path : path.split('store/')[1];
	var storePath = path.split('store/')[1];
	//use backbone router instead...
	
	//require('.modules/communicator').initialize((storePath) ? storePath : path);
	
	//Moduleq
	require('./modules/visualStruct').initialize(storePath);
	require('./modules/musicalStruct').initialize(storePath);
	//envoi ici un message au lieu de initialize... pour init les deux...
	
	//Views
	require('./views/toolsView').initialize();
	require('./views/playerView').initialize();
	require('./views/instrumentView').initialize();
});
