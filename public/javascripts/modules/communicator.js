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
	
	socket.on('initResponse', function(seq) {
		communicator.publish('initResponse', seq);
	})
	

	function sendSelection(range) {
		console.log(jasmed.user + ' emits toggleSelection');
		socket.emit('toggleSelection', range);
	};

	function sendnewBloc() {
		socket.emit('newBloc');
	};

	communicator.subscribe('selectionToServer', sendSelection);
	communicator.subscribe('newBlocToServer', sendnewBloc);
	
	//
	communicator.subscribe('saveAs', function(seq) {
		console.log(jasmed.user + ' emits saveAs : ' + seq.name);
		console.log(JSON.stringify(seq.data));
		socket.emit('saveAs', seq);
	});
	
	communicator.subscribe('init', function() {
		console.log(jasmed.user + ' emits init');
		socket.emit('init');
	});
})(jasmed.module('communicator'));