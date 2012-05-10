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
		console.log(jasmed.user + ' received a toggleSelectionBroad from ' + selection.user);
		communicator.publish('toggleSelectionBroad', selection);
	});
	
	socket.on('newBlockBroad', function() {
		console.log('newBlockBroad received from server');
		communicator.publish('newBlockBroad');
	});
	
	socket.on('initializationRes', function(seq) {
		console.log('initializationRes received from server');
		communicator.publish('initializationRes', seq);
	})
	

	/**
	 *  SUBSCRIBE => EMIT
	 */

	function toggleSelectionRes(selection) {
		console.log(jasmed.user + ' emits toggleSelectionRes');
		socket.emit('toggleSelectionRes', selection);
	};

	function newBlockRes() {
		console.log(jasmed.user + ' emits newBlockRes');
		socket.emit('newBlockRes');
	};

	communicator.subscribe('toggleSelectionRes', toggleSelectionRes);
	
	communicator.subscribe('newBlockRes', newBlockRes);
	
	communicator.subscribe('saveAs', function(seq) {
		console.log(jasmed.user + ' emits saveAs : ' + seq.name);
		console.log(JSON.stringify(seq.data));
		socket.emit('saveAs', seq);
	});
	
	communicator.subscribe('initialization', function() {
		console.log(jasmed.user + ' emits initialization');
		socket.emit('initialization');
	});

})(jasmed.module('communicator'));