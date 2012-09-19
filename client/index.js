var $ = require('jquery');

// Single entry point into the application.
$(function() {
  // var storePath = (path === 'app') ? path : path.split('store/')[1];
  var path = window.location.pathname
    , storePath = path.split('store/')[1];
  // TODO: try using backbone router instead...
  
  require('./modules/communicator').initialize((storePath) ? storePath : path.split('/')[1]);
  
  // Modules
  require('./modules/visualStruct').initialize(storePath);
  require('./modules/musicalStruct').initialize(storePath);
  // TODO: envoi ici un message au lieu de initialize... pour init les deux...
  require('./modules/player').initialize();
  
  // Views
  require('./views/toolsView').initialize();
  require('./views/playerView').initialize();
  require('./views/instrumentView').initialize();
});
