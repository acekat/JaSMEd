// Module dependencies

var express = require('express')
	, app = module.exports = express.createServer()
	, io = require('socket.io').listen(app)
	, stylus = require('stylus');

// Configuration

app.configure(function() {
	app.set('views', __dirname + '/views/template');
	app.set('view engine', 'jade');
	app.set('view options', {
		layout: false
	});
	app.use(stylus.middleware({ 
		src: __dirname + '/views',
		dest: __dirname + '/public'
	}));
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
	res.render('index', {
		title : 'psar 1st draft'
	});
});

// Socket 

io.sockets.on('connection', function (socket) {
	socket.on('toggleNote', function (note) {
		console.log('msg reçu: toggleNote ' + note.name + ' ' + note.num);
		socket.broadcast.emit('toggleNote', note);
	});
});

app.listen(2222);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

/*
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
*/
