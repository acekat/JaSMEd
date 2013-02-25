var communicator = {};

/**
 *  DEPENDENCIES
 */
var io = window.io //require('socket.io');
  , bus = require('bus');

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
    bus.emit('serverSelection', selection);
  });

  socket.on('serverNewBlock', function() {
    bus.emit('serverNewBlock');
  });

  socket.on('serverInit', function(seq) {
    bus.emit('serverInit', seq);
  });

  socket.on('musicalStructServerInit', function(seq) {
    bus.emit('musicalStructServerInit', seq);
  });
}

/**
 *  SUBSCRIBE => EMIT
 */

bus.on('musicalStructSelection', function(selection) {
  socket.emit('musicalStructSelection', selection);
});

bus.on('musicalStructNewBlock', function() {
  socket.emit('musicalStructNewBlock');
});

bus.on('visualStructExport', function(seq) {
  socket.emit('visualStructExport', seq);
});

bus.on('musicalStructExport', function(seq) {
  socket.emit('musicalStructExport', seq);
});

bus.on('visualStructInit', function(seqName) {
  socket.emit('visualStructInit', seqName);
});

bus.on('musicalStructInit', function(seqName) {
  socket.emit('musicalStructInit', seqName);
});


/**
 *  PUBLIC API
 */
module.exports = {
  initialize: initialize,
  getUser: getUser
}
