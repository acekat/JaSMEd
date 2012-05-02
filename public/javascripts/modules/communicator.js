(function(communicator) {
	var socket = io.connect('http://localhost/');
	var user = null;

	socket.on('connect', function(data) {
		console.log('socket.io connection established');
	});
	
	socket.on('error', function(reason) {
	  console.error('Unable to connect Socket.IO', reason);
	});
	
	socket.on('loginSync', function(login) {
		console.log('login: ' + login);
		user = login;
	});
	
	socket.on('noteToggled', function (id) {
		console.log(user + ' just received a noteToggled: ' + id);
		communicator.publish('noteToggled', id);
	});
	
	// calls toggleNote upon reception of 'noteToggled' msg
	//editor.subscribe('noteToggled', editor.LayerView.toggleNote);
	
	function toggleNote(id) {
		console.log(user + ' about to emit toggleNote: ' + id);
		socket.emit('toggleNote', id)
	}
	
	/*
	function selectRange(start, end) {
		console.log(user + ' about to emit selectRange: ' + start + ' | ' + end);
		socket.emit('selectRange', {
			start: start,
			end: end
		})
	}
	*/

	communicator.subscribe('toggleNote', toggleNote);
	//communicator.subscribe('selectRange', toggleNote(start, end));
})(jasmed.module('communicator'));