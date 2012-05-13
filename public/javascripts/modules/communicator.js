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

socket.on('loginSync', function(login) {
	console.log('login: ' + login);
	jasmed.user = login;
});

socket.on('toggleSelectionBroad', function(selection) {
	console.log(jasmed.user + ' received a toggleSelection from ' + selection.user);
	communicator.publish('toggleSelectionRes', selection);
	communicator.publish('toggleSelectionBroad', selection);
});

socket.on('newBlockBroad', function() {
	console.log('newBlockBroad received from server');
	communicator.publish('newBlockRes');
	communicator.publish('newBlockBroad');
});

socket.on('editorInitRes', function(seq) {
	console.log('editorInitRes received from server');
	communicator.publish('editorInitRes', seq);
	//so structure doesn't break!
	communicator.publish('initializationRes');
})


/**
 *  SUBSCRIBE => EMIT
 */

communicator.subscribe('toggleSelectionServer', function(selection) {
	console.log(jasmed.user + ' emits toggleSelectionServer');
	socket.emit('toggleSelectionServer', selection);
});

communicator.subscribe('newBlockServer', function() {
	console.log(jasmed.user + ' emits newBlockServer');
	socket.emit('newBlockServer');
});

communicator.subscribe('editorGridExport', function(seq) {
	console.log(jasmed.user + ' emits saveAs : ' + seq.name);
	console.log(JSON.stringify(seq.data));
	socket.emit('editorGridExport', seq);
});

//I WANT MSG TO BE LIKE SOOOOO: [moduleName]init par module!
communicator.subscribe('editorInit', function() {
	console.log(jasmed.user + ' emits editorInit');
	socket.emit('editorInit');
});

})(jasmed.module('communicator'));
