var express = require('express')
	, http = require('http')
	, fs = require('fs')
	, auth = require('./modules/authentification')
	, utils = require('./modules/utils')
	,	store = require('./modules/store')
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

app.get('/draft', requireLogin, function(req, res) {
	core.init(function(seq) {
		if (!req)
			return;
		
		res.render('draft', {
				seq: seq
			,	pitches: core.pitches
		});
	});
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

app.get('/login', function(req, res) {
	res.render('login', { title: 'LOGIN!!!'	});
});

app.get('/logout', function(req, res) {
	req.session.regenerate(function(err) {
		if (err)
			console.log('error regenerating session: ' + err);
	 });
	res.redirect('/');
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

app.get('/store/:name', requireLogin, function(req, res) {
	req.session.seqName = req.params.name;
	res.render('app');
});

app.get('/app', requireLogin, function(req, res) {
	delete req.session.seqName;
	res.render('app');
});

/**
 * socket.io
 */
io.sockets.on('connection', function (socket) {
	var session = socket.handshake.session;

	socket.emit('loginSync', session.login);
	
	socket.on('init', function() {
		if (!session.seqName) {
			socket.emit('initResponse');
			return;
		}
		
		console.log(session.login + ' about to open ' + session.seqName);
		store.importSeq(session.seqName, function(data) {
			if (!data)
				console.log('error reading file'); //must do something about that
			
			console.log('about to emit back: ' + session.seqName + ' + ' + JSON.stringify(data));
			socket.emit('initResponse', {
				name: session.seqName,
				data: data
			});
		});
	})
	
	socket.on('saveAs', function(seq) {
		store.exportSeq(seq.name, seq.data, function(res) {
			if (!res)
				console.log(session.login + ' error trying to save sequencer');
			else
				console.log(session.login + ' saved current sequencer as ' + seq.name);
		});
	});

	socket.on('toggleSelection', function(range) {
		console.log(range.user + ' toggled selection.'); //msg a ameliorer
		socket.broadcast.emit('toggleSelection', range);
	});

	socket.on('newBloc', function() {
		socket.broadcast.emit('newBloc');
	});
});

/**
 * start listening!
 */
server.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
