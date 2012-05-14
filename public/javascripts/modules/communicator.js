(function(communicator) {

var socket = io.connect('http://localhost/');

/**
 *  ON => PUBLISH
 */

socket.on('connect', function(data) {
	console.log('socket.io connection established');
});

socket.on('error', function(reason) {
	console.error('Unable to connect Socket.IO', reason);
});

socket.on('serverLogin', function(login) {
	console.log('login: ' + login);
	jasmed.user = login;
});

socket.on('serverSelection', function(selection) {
	communicator.publish('serverSelection', selection);
});

socket.on('serverNewBlock', function() {
	communicator.publish('serverNewBlock');
});

socket.on('serverInit', function(seq) {
	communicator.publish('serverInit', seq);
})


/**
 *  SUBSCRIBE => EMIT
 */

communicator.subscribe('structSelection', function(selection) {
	socket.emit('structSelection', selection);
});

communicator.subscribe('structNewBlock', function() {
	socket.emit('structNewBlock');
});

communicator.subscribe('editorModelsExport', function(seq) {
	socket.emit('editorModelsExport', seq);
});

communicator.subscribe('editorModelsInit', function() {
	socket.emit('editorModelsInit');
});

})(jasmed.module('communicator'));
