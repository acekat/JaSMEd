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
	
	socket.on('initializationRes', function(seq) {
		console.log('initializationRes received from server');
		communicator.publish('initializationRes', seq);
	})
	

	/**
	 *  SUBSCRIBE => EMIT
	 */

	function toggleSelectionServer(selection) {
		console.log(jasmed.user + ' emits toggleSelectionServer');
		socket.emit('toggleSelectionServer', selection);
	};

	function newBlockServer() {
		console.log(jasmed.user + ' emits newBlockServer');
		socket.emit('newBlockServer');
	};

	communicator.subscribe('toggleSelectionServer', toggleSelectionServer);
	
	communicator.subscribe('newBlockServer', newBlockServer);
	
	// communicator.subscribe('saveAs', function(seq) {
	// 	console.log(jasmed.user + ' emits saveAs : ' + seq.name);
	// 	console.log(JSON.stringify(seq.data));
	// 	socket.emit('saveAs', seq);
	// });
	
	communicator.subscribe('initializationServer', function() {
		console.log(jasmed.user + ' emits initializationServer');
		socket.emit('initializationServer');
	});

})(jasmed.module('communicator'));