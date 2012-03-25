var sequencer = [];
var pitches = ["do4", "do#4", "re4", "re#4", "mi4", "fa4", "fa#4", "sol4", "sol#4", "la4", "sib4", "si4",
								"do5", "do#5", "re5", "re#5", "mi5", "fa5", "fa#5", "sol5", "sol#5", "la5", "sib5", "si5"];
var nbBars = 12;

var initSequencer = function() {
	var i = 0, j = 0, k = 0;

	//tous les impaires -> collonne + 2
	//tous les paires = 4
	for (i = 0; i < nbBars; i++) {
		sequencer[i] = [];
		for (j = 0; j < pitches.length; j++) {
			sequencer[i][j] = [];
			if (i % 2) {
				for (k = 0; k < (i + 2); k++) {
					sequencer[i][j][k] = null;
				}
			} else {
				for (k = 0; k < 4; k++) {
					sequencer[i][j][k] = null;
				}
			}
		}
	}
};

var toggleNote = function(note, login) {
	if (sequencer[note.bar][note.pitch][note.noteNum])
		sequencer[note.bar][note.pitch][note.noteNum] = null;
	else
		sequencer[note.bar][note.pitch][note.noteNum] = {login: login};
}

module.exports = {
	init: initSequencer,
	toggleNote: toggleNote,
	pitches: pitches,
	seq: sequencer
}
