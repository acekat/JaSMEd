(function(communicator) {

var path = window.location.pathname;
var storePath = path.split('store/')[1];
var namespace = (path === '/app') ? 'app' : storePath;

var socket = io.connect('http://localhost/' + namespace);

/**
 *  ON => PUBLISH
 */

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
});

socket.on('structServerInit', function(seq) {
	communicator.publish('structServerInit', seq);
});


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

communicator.subscribe('structExport', function(seq) {
	socket.emit('structExport', seq);
});

communicator.subscribe('editorModelsInit', function(seqName) {
	socket.emit('editorModelsInit', seqName);
	//console.log('socket emited editorModelsInit', seqName);
});

communicator.subscribe('structInit', function(seqName) {
	socket.emit('structInit', seqName);
	//console.log('socket emited editorModelsInit', seqName);
});

})(jasmed.module('communicator'));
