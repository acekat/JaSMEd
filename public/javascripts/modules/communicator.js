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
	console.log(jasmed.user + ' received a serverSelection from ' + selection.user);
	communicator.publish('serverSelection', selection);
});

socket.on('serverNewBlock', function() {
	console.log('serverNewBlock received');
	communicator.publish('serverNewBlock');
});

socket.on('serverInit', function(seq) {
	console.log('serverInit received');
	// PLEASE THIBAUD DESCRIBE WHAT SEQ STRUCTURE IS ON GOOGLE DOC!!!
	communicator.publish('serverInit', seq);
})


/**
 *  SUBSCRIBE => EMIT
 */

communicator.subscribe('structSelection', function(selection) {
	console.log(jasmed.user + ' emits structSelection');
	socket.emit('structSelection', selection);
});

communicator.subscribe('structNewBlock', function() {
	console.log(jasmed.user + ' emits structNewBlock');
	socket.emit('structNewBlock');
});

communicator.subscribe('editorModelsExport', function(seq) {
	// console.log(jasmed.user + ' emits saveAs : ' + seq.name);
	// console.log(JSON.stringify(seq.data));
	socket.emit('editorModelsExport', seq);
});

communicator.subscribe('editorModelsInit', function() {
	console.log(jasmed.user + ' emits editorModelsInit');
	socket.emit('editorModelsInit');
});

})(jasmed.module('communicator'));
