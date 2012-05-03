(function(communicator) {

	var socket = io.connect('http://localhost/');

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
	
	socket.on('toggleSelection', function(range) {
		console.log(jasmed.user + ' received a toggleSelection from ' + range.user);
		communicator.publish('toggleSelection', range);
	});
	

	function sendSelection(range) {
		console.log(jasmed.user + ' emit toggleSelection');
		socket.emit('toggleSelection', range);
	};

	communicator.subscribe('selectionToServer', sendSelection);

})(jasmed.module('communicator'));