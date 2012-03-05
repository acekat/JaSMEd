var socket = io.connect('http://localhost');

var APP = (function() {
	var doTab = [];
	var miTab = [];
	var solTab = [];
	var sequencer = [doTab, miTab, solTab];	
	
	var initSequencer = function() {
		var i;
		
		for (row in sequencer) {
			for (i = 0; i < 16; i++) {
				sequencer[row][i] = 0;
			}
		}
	}
	
	var toggleSeqNote = function(seqNote) {
		if (seqNote)
			seqNote = 0
		else seqNote = 1;
		
		return seqNote;
	}
	
	var toggleNote = function(note, num) {		 
		switch(note) {
			case 'do':
				doTab[num - 1] = toggleSeqNote(doTab[num - 1]);
				break;
			
			case 'mi':
				miTab[num - 1] = toggleSeqNote(miTab[num - 1]);
				break;
				
			case 'sol':
				solTab[num - 1] = toggleSeqNote(solTab[num - 1]);
				break;
				
			default:
				console.log('switch error, note not recognized');
				break;
		}
		
		$('#' + note).children(':nth-child(' + (num + 1) + ')').toggleClass('on');
		console.log(note + ' ' + num + ' toggled');
	}
	
	return {
		init: initSequencer,
		toggleNote: toggleNote,
		seq: sequencer,
	}
})();

$(function() {
	APP.init();

	socket.on('connect', function (data) {
		console.log('socket.io connection established');
	});

	$('.box:not(:first-child)').bind('dblclick', function(e) {
		var self = $(this);
		//emit to server
		socket.emit('toggleNote', {
			name: self.parent().attr('id'),
			num: self.index()
		});
		//console.log('dblclicked: ' + self.parent().attr('id') + self.index());
		APP.toggleNote(self.parent().attr('id'), self.index());
	});
	
	socket.on('toggleNote', function (note) {
		APP.toggleNote(note.name, note.num);
	});
});
