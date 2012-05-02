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
		communicator.publish('loginSync', login);
	});
	
	socket.on('noteToggled', function (range) {
		console.log(user + ' just received a noteToggled: ' + range);
		communicator.publish('noteToggled', range);
	});
	
	// calls toggleNote upon reception of 'noteToggled' msg
	//editor.subscribe('noteToggled', editor.LayerView.toggleNote);
	
	function toggleNote(range) {
		console.log(user + ' about to emit toggleNote: ' + range);
		socket.emit('toggleNote', range);
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