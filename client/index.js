var $ = window.$; //require('jquery');

// Single entry point into the application.
$(function() {
  // var storePath = (path === 'app') ? path : path.split('store/')[1];
  var path = window.location.pathname
    , storePath = path.split('store/')[1];
  // TODO: try using backbone router instead...
  
  require('communicator').initialize((storePath) ? storePath : path.split('/')[1]);
  
  // Modules
  require('visualStruct').initialize(storePath);
  require('musicalStruct').initialize(storePath);
  // TODO: envoi ici un message au lieu de initialize... pour init les deux...
  require('player').initialize();
  
  // Views
  require('toolsView').initialize();
  require('playerView').initialize();
  require('instrumentView').initialize();
});
