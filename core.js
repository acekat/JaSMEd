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
};

var toggleSeqNote = function(seqNote) {
	if (seqNote)
		seqNote = 0
	else seqNote = 1;
	
	return seqNote;
};

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
	
	//console.log(note + ' ' + num + ' toggled');
};

module.exports = {
	init: initSequencer,
	toggleNote: toggleNote,
	seq: sequencer
}

/*
module.exports.init = initSequencer;
module.exports.toggleNote = toggleNote;
module.exports.seq = sequencer;
*/
