var express = require('express')
	, connect = require('express/node_modules/connect')
	, app = module.exports = express.createServer()
	, io = require('socket.io').listen(app)
	, stylus = require('stylus')
	, MemoryStore = connect.middleware.session.MemoryStore
	, Session = connect.middleware.session.Session
	, parseCookie = connect.utils.parseCookie
	, sessionStore = new MemoryStore()
	, users = require('./users')
	, core = require('./core');

//var Session = require('connect').middleware.session.Session;

core.init();

// Configuration
app.configure(function() {
	//app.use(express.logger());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	//activer new inheritance (extends et block)
	app.set('view options', { layout: false });
	app.use(stylus.middleware({
			src: __dirname + '/views'
		,	dest: __dirname + '/public'
	}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	// Populates:
	  //   - req.session
	  //   - req.sessionStore
	  //   - req.sessionID (or req.session.id)
	app.use(express.session({
			secret: 'mama loves mambo'
		, store: sessionStore
		,	key: 'express.sid'
	}));
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// pour avoir accès à ces variables dans les views (sans passer en paramètre)
app.dynamicHelpers({
	session: function(req, res) {
		return req.session;
	},
	flash: function(req, res) {
		return req.flash();
	}
});

/** Middleware for limited access */
function requireLogin(req, res, next) {
	if (req.session.login) {
		// User is authenticated, let him in
		next();
	} else {
		// Otherwise, we redirect him to login form
		req.flash('warn', 'login needz yo!!');
		//pour le rediriger...
		req.session.redir = req.path;
		res.redirect('/login');
	}
}

/**
 * routes
 */
//app.get('/', routes.index);
app.get('/', function(req, res) {
	res.render('index');
});

app.get('/draft', requireLogin, function(req, res) {
	res.render('draft', {
		seq: core.seq,
		pitches: core.pitches
	});
});

app.get('/session', requireLogin, function(req, res) {
	if (req.session.views)
		++req.session.views;
	else
		req.session.views = 1;

	console.log('session: ')
	for (props in req.session) {
		console.log(props + '\n');
	};


	res.render('session', {
		title: 'session!',
		sessionID: req.sessionID
	});
});

app.get('/login', function(req, res) {
	res.render('login', {
		title: 'LOGIN!!!'
	});
});

app.get('/logout', function(req, res) {
	delete req.session.login;
	//ne détruit pas la session... seulement .login
	res.redirect('/');
});

app.post('/login', function(req, res) {
	users.authenticate(req.body.username, req.body.password, function(user) {
		if (user) {
			req.session.login = user.login;
			//ps.. pas forcé de supprimé req.session.redir
			var redir = req.session.redir || '/';
			delete req.session.redir;
			res.redirect(redir);
		} else {
			req.flash('warn', 'tough luck, login failed brother');
			res.redirect('/login');
		}
	});
});

/**
 * socket.io
 */
io.configure(function() {
	io.set('log level', 1); //sinon il log beaucoup trop, ça me rend fou :)
	io.set('authorization', function(data, callback) {
		if (!data.headers.cookie)
			callback('No cookie', false);

		var cookie = parseCookie(data.headers.cookie);
		data.sessionID = cookie['express.sid'];
		data.sessionStore = sessionStore;

		sessionStore.load(data.sessionID, function(err, session) {
			if (err || !session)
				callback('Error', false);

			//data.session = new Session(data, session)
			data.session = session;
			callback(null, true);
		});
	});
});

io.sockets.on('connection', function (socket) {
	var session = socket.handshake.session;

	socket.emit('loginSync', session.login);

	//need to only allow 1 sessionID

	socket.on('add', function(data) {
		session.newattr = data;
		console.log(session.newattr + ' added to ' + session.login + '\'s session');
		session.save();
	});

	socket.on('toggleNote', function(note) {
		console.log(session.login + ' toggled note');
		core.toggleNote(note, session.login);
		note.login = session.login;
		socket.broadcast.emit('toggleNote', note);
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);