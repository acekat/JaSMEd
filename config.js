var	connect = require('express/node_modules/connect')
	, stylus = require('stylus')
	, utils = connect.utils
	,	cookieSecret = 'Connect 2. needs a secret!'
	,	sessionKey = 'JaSMEd.sid';

function expressConfig(app, express, sessionStore) {
	app.configure(function() {
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.set('port', 3000);
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(stylus.middleware({
			  src: __dirname + '/views'
			, dest: __dirname + '/public'
		}));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser(cookieSecret));
		app.use(express.session({
			  secret: 'mama loves mambo'
			, store: sessionStore
			, key: sessionKey
		}));
		// order matters: needs to be after stylus for it to recompile
		app.use(express.static(__dirname + '/public')); 
	});

	app.configure('development', function() {
		app.use(express.errorHandler());
	});
}

function socketIOConfig(io, sessionStore) {
	io.configure(function() {
		io.set('log level', 1); // minimal logs...
		io.set('transports', ['websocket']); // ONLY WEBSOCKET (faster ? could switch to ws)
		io.set('authorization', function(data, callback) {
			if (!data.headers.cookie)
				return callback('No cookie', false);

			//data est ce qui sera exposé dans socket.handshake.session
			var cookie = utils.parseCookie(data.headers.cookie);
			var sid = cookie[sessionKey].split('.')[0];
			var signedSid = utils.sign(sid, cookieSecret);

			if (signedSid !== cookie[sessionKey])
				return callback('SID don\'t match', false);

			data.sessionID = sid;
			data.sessionStore = sessionStore;

			sessionStore.load(data.sessionID, function(err, session) {
				if (err || !session)
					return callback('Error loading session', false);

				data.session = session;
				callback(null, true);
			});
		});
	});
}

module.exports = function(app, express, io, sessionStore) {
	var RedisStore = require('connect-redis')(express);
	sessionStore = new RedisStore();
	
	expressConfig(app, express, sessionStore);
	socketIOConfig(io, sessionStore);
}
