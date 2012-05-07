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
	
	socket.on('newBloc', function() {
		communicator.publish('newBloc');
	});
	

	function sendSelection(range) {
		console.log(jasmed.user + ' about to emit toggleSelection');
		socket.emit('toggleSelection', range);
	};

	function sendnewBloc() {
		socket.emit('newBloc');
	};

	communicator.subscribe('selectionToServer', sendSelection);
	communicator.subscribe('newBlocToServer', sendnewBloc);
	
	//
	communicator.subscribe('saveAs', function(seq) {
		console.log(jasmed.user + ' about to emit saveAs : ' + seq.name);
		console.log(JSON.stringify(seq.data));
		socket.emit('saveAs', seq);
	});
})(jasmed.module('communicator'));