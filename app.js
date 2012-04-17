var express = require('express')
	, http = require('http')
	, connect = require('express/node_modules/connect')
	, stylus = require('stylus')
	, RedisStore = require('connect-redis')(express)
	, parseCookie = connect.utils.parseCookie
	, sessionStore = new RedisStore()
	, fs = require('fs')
	, users = require('./users')
	, core = require('./core');

var app = express();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('port', 3000);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.static(__dirname + '/public'));
	app.use(stylus.middleware({
			src: __dirname + '/views' //mettre ça ailleurs non ?
		,	dest: __dirname + '/public'
	}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('Connect 2. needs a secret!'));
	app.use(express.session({
			secret: 'mama loves mambo'
		, store: sessionStore
		,	key: 'express.sid'
	}));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

/** expose locals to view before rendering */
app.locals.use(function(req, res, done) {
	res.locals.session = req.session;
	res.locals.flashMessages = flash(req);
	done();
});

/** inspired by Express 2.x req.flash() */
function flash(req, type, msg) {
	if (req.session === undefined) throw Error('req.flashMessage() requires sessions');
	var msgs = req.session.messages = req.session.messages || {};
	
	if (type && msg)
		return (msgs[type] = msgs[type] || []).push(msg);
	else if (type) { //not used for the moment
		var arr = msgs[type];
		delete msgs[type];
		return arr || [];
	} else {
		req.session.messages = {};
		return msgs;
	}
};

/** Middleware for limited access */
function requireLogin(req, res, next) {
	if (req.session.login) {
		// User is authenticated, let him in
		next();
	} else {
		// Otherwise, we redirect him to login form
		flash(req, 'warn', 'login needz yo!!');
		req.session.redir = req.path;
		res.redirect('/login');
	}
}

/**
 * routes
 */
app.get('/', function(req, res) {
	fs.readdir('./store', function(err, files) {
		if (err) {
			console.err('problem reading directory');
			return;
		}

		res.render('index', { files: files });
	})
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
	req.session.regenerate();
	res.redirect('/');
});

app.post('/login', function(req, res) {
	//need to only allow 1 sessionID
	users.authenticate(req.body.username, req.body.password, function(user) {
		if (user) {
			req.session.login = user.login;
			var redir = req.session.redir || '/';
			delete req.session.redir;
			res.redirect(redir);
		} else {
			flash(req, 'warn', 'tough luck, login failed brother');
			res.redirect('/login');
		}
	});
});

app.get('/store/:name', requireLogin, function(req, res) {
	core.openSeq(req.params.name, function(seq) {
		if (!seq)
			return;
		
		res.render('draft', {
				seq: seq
			,	pitches: core.pitches
		});
	});
});

var server = app.listen(app.settings.port);

/**
 * socket.io
 */
var io = require('socket.io').listen(server);

io.configure(function() {
	io.set('log level', 1); //sinon il log beaucoup trop, ça me rend fou :)
	io.set('authorization', function(data, callback) {
		if (!data.headers.cookie)
			callback('No cookie', false);

		//data est ce qui sera exposé dans socket.handshake.session
		var cookie = parseCookie(data.headers.cookie);
		//data.sessionID = cookie['express.sid'];
		data.sessionID = cookie['express.sid'].split('.')[0];
		data.sessionStore = sessionStore;

		sessionStore.load(data.sessionID, function(err, session) {
			if (err || !session) {
				callback('Error', false);
			}
			
			data.session = session;
			callback(null, true);
		});
	});
});

io.sockets.on('connection', function (socket) {
	var session = socket.handshake.session;

	socket.emit('loginSync', session.login);

	socket.on('add', function(data) {
		session.newattr = data;
		console.log(session.newattr + ' added to ' + session.login + '\'s session');
		session.save();
	});
	
	//do something
	socket.on('saveAs', function(fileName) {
		core.exportSeq(fileName, function(res) {
			if (!res)
				console.log(session.login + ' error trying to save sequencer');
			else
				console.log(session.login + ' saved current sequencer as ' + fileName);
		});
	});

	socket.on('toggleNote', function(note) {
		console.log(session.login + ' toggled note');
		core.toggleNote(note, session.login);
		note.login = session.login;
		socket.broadcast.emit('toggleNote', note);
	});
});

console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
