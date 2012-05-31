var express = require('express')
	, http = require('http')
	, auth = require('./modules/authentification')
	, utils = require('./modules/utils')
	, store = require('./modules/store')
	, sessionStore;

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// config
require('./config')(app, express, io, sessionStore);

/** 
 * expose locals to view before rendering
 */
app.locals.use(function(req, res, done) {
	res.locals.session = req.session;
	res.locals.flashMessages = utils.flash(req);
	done();
});

/** 
 * Middleware for limited access 
 */
function requireLogin(req, res, next) {
	if (req.session.login) {
		// User is authenticated, let him in
		next();
	} else {
		// Otherwise, we redirect him to login form
		utils.flash(req, 'warn', 'login needz yo!!');
		req.session.redir = req.path;
		res.redirect('/login');
	}
}

/**
 * Routes
 */
app.get('/', function(req, res) {
	store.list(function(fileList) {
		res.render('index', { files: fileList });
	});
});

app.get('/login', function(req, res) {
	res.render('login', { title: 'LOGIN!!!'	});
});

app.post('/login', function(req, res) {
	//need to only allow 1 sessionID
	auth.authenticate(req.body.username, req.body.password, function(user) {
		if (user) {
			req.session.login = user.login;
			var redir = req.session.redir || '/';
			delete req.session.redir;
			res.redirect(redir);
		} else {
			utils.flash(req, 'warn', 'tough luck, login failed brother');
			res.redirect('/login');
		}
	});
});

app.get('/logout', function(req, res) {
	req.session.regenerate(function(err) {
		if (err)
			console.log('error regenerating session: ' + err);
	 });
	res.redirect('/');
});

app.get('/session', requireLogin, function(req, res) {
	if (req.session.views)
		++req.session.views;
	else
		req.session.views = 1;

	res.render('session', {
			title: 'session!'
		,	sessionID: req.sessionID
	});
});

app.get('/app', requireLogin, function(req, res) {
	res.render('app');
});

app.get('/store/:name', requireLogin, function(req, res) {
	res.render('app');
});

/**
 * socket.io
 */
io.sockets.on('connection', function (socket) {
	var session = socket.handshake.session;

	//do something better about that...
	socket.emit('serverLogin', session.login);
	
	socket.on('editorModelsInit', function(seqName) {
		console.log('editorModelsInit', seqName);
		if (!seqName) {
			socket.emit('serverInit');
			return;
		}
		
		var seqPath = seqName + '.models';
		store.importSeq(seqPath, function(data) {
			if (!data) {
				console.log('error reading file');
				socket.emit('serverInit'); //should send back an error to tell client file doesn't exist!!
				return;
			}
			
			// console.log('about to emit back: ' + session.seqName + ' + ' + JSON.stringify(data));
			socket.emit('serverInit', {
				name: seqName,
				data: data
			});
		});
	});
	
	socket.on('structInit', function(seqName) {
		console.log('structInit', seqName);
		if (!seqName) {
			socket.emit('structServerInit');
			return;
		}
		
		var seqPath = seqName + '.struct';
		store.importSeq(seqPath, function(data) {
			if (!data) {
				console.log('error reading file');
				socket.emit('structServerInit'); //should send back an error to tell client file doesn't exist!!
				return;
			}
			
			// console.log('about to emit back: ' + session.seqName + ' + ' + JSON.stringify(data));
			socket.emit('structServerInit', {
				name: seqName,
				data: data
			});
		});
	});
	
	socket.on('editorModelsExport', function(seq) {
		var seqPath = seq.name + '.models';
		console.log('seqPath', seqPath);
		store.exportSeq(seqPath, seq.data, function(res) {
			if (!res)
				console.log(session.login + ' error trying to save sequencer');
			else
				console.log(session.login + ' saved current sequencer as ' + seqPath);
		});
	});
	
	socket.on('structExport', function(seq) {
		var seqPath = seq.name + '.struct';
		console.log('seqPath', seqPath);
		store.exportSeq(seqPath, seq.data, function(res) {
			if (!res)
				console.log(session.login + ' error trying to save sequencer');
			else
				console.log(session.login + ' saved current sequencer as ' + seqPath);
		});
	});

	socket.on('structSelection', function(selection) {
		console.log(selection.user + ' toggled a selection.'); //msg a ameliorer
		socket.broadcast.emit('serverSelection', selection);
	});

	socket.on('structNewBlock', function() {
		console.log("serverNewBlock broadcasted.");
		socket.broadcast.emit('serverNewBlock');
		//
	});
});

/**
function structNewBlock() {
	var grid = editor.grid(name);
	var width = grid.last().refWidth;
	grid.add({
		width: width
	});
};

function structSelection(selection) {
	editor.grid(name).selectRange(selection);
};
*/

/**
 * start listening!
 */
server.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
