var communicator = {};

/**
 *  DEPENDENCIES
 */
var io = require('socket.io');
require('mediator').installTo(communicator);

/**
 *  INSTANCES
 */
var user
  , socket;

/**
 *  INITIALIZATION
 */
function initialize(namespace) {
  socket = io.connect('http://localhost/' + namespace);
  listeners();
}


/**
 *  FUNCTIONS
 */
function getUser() {
  return user;
}

/**
 *  ON => PUBLISH
 */

function listeners() {
  socket.on('connect', function(data) {
    console.log('socket.io connection established');
    /*
    devrait publish un message pour init à la place d'appeler initialize...
    car parfois connexion est lente..., fait des pub/sub avant ouverture de ws...
    ou alors faire un requête XHR...
    */
  });

  socket.on('error', function(reason) {
    console.error('Unable to connect Socket.IO', reason);
  });

  socket.on('serverLogin', function(login) {
    console.log('login: ' + login);
    user = login;
  });

  socket.on('serverSelection', function(selection) {
    communicator.publish('serverSelection', selection);
  });

  socket.on('serverNewBlock', function() {
    communicator.publish('serverNewBlock');
  });

  socket.on('serverInit', function(seq) {
    communicator.publish('serverInit', seq);
  });

  socket.on('musicalStructServerInit', function(seq) {
    communicator.publish('musicalStructServerInit', seq);
  });
}

/**
 *  SUBSCRIBE => EMIT
 */

communicator.subscribe('musicalStructSelection', function(selection) {
  socket.emit('musicalStructSelection', selection);
});

communicator.subscribe('musicalStructNewBlock', function() {
  socket.emit('musicalStructNewBlock');
});

communicator.subscribe('visualStructExport', function(seq) {
  socket.emit('visualStructExport', seq);
});

communicator.subscribe('musicalStructExport', function(seq) {
  socket.emit('musicalStructExport', seq);
});

communicator.subscribe('visualStructInit', function(seqName) {
  socket.emit('visualStructInit', seqName);
});

communicator.subscribe('musicalStructInit', function(seqName) {
  socket.emit('musicalStructInit', seqName);
});


/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize,
  getUser: getUser
}
