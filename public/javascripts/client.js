var socket = io.connect('http://localhost/');

var APP = (function() {
	var sequencer = [];
	var pitches = ['do4', 'do#4', 're4', 're#4', 'mi4', 'fa4', 'fa#4', 'sol4', 'sol#4', 'la4', 'sib4', 'si4',
									'do5', 'do#5', 're5', 're#5', 'mi5', 'fa5', 'fa#5', 'sol5', 'sol#5', 'la5', 'sib5', 'si5'];
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
	
	socket.on('error', function (reason) {
	  console.error('Unable to connect Socket.IO', reason);
	});
	
	socket.on('loginSync', function (login) {
		console.log('login: ' + login);
		APP.login = login;
	});
	
	var visualToggle = function(el, login) {
		var loginClass = 'login-' + login;
		var curClass = el.attr('class').match('login-[^ ]*');
				
		if (curClass)
			el.removeClass(curClass[0]);
		
		el.toggleClass('on');
		
		if (el.hasClass('on'))
			el.addClass(loginClass);
	}

	$('.note').on('dblclick', function(event) {
		var el = $(this);
		var noteNum = el.attr('class').match('sn-[0-9]*')[0].split('-')[1];
		var pitch = el.parent().attr('class').split(' ')[1];
		var pNum = el.parent().attr('class').match('p-[0-9]*')[0].split('-')[1];
		var bar = el.parent().parent().attr('class').match('bc-[0-9]*')[0].split('-')[1];
		
		var note = {
			bar: bar - 1,
			pitch: pNum - 1,
			noteNum: noteNum - 1
		};
		console.log('clicked on ');
		console.log(note);
		
		APP.toggleNote(note, APP.login);
		
		socket.emit('toggleNote', note);
		
		visualToggle(el, APP.login);
	});
	
	socket.on('toggleNote', function (note) {
		APP.toggleNote(note, note.login);
		var selector = '.bc-' + (note.bar + 1) + ' > .p-' + (note.pitch + 1) + ' > .sn-' + (note.noteNum + 1);
		
		visualToggle($(selector), note.login);
	});
});
