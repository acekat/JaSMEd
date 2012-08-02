var	connect = require('express/node_modules/connect')
	, stylus = require('stylus')
	, flash = require('connect-flash')
	, utils = require('./modules/utils')
	, nodeCookie = require('cookie')
	,	cookieSecret = 'whambaamthankyoumaaammm!'
	,	sessionKey = 'JaSMEd.sid';

/** 
 * expose locals to view before rendering
 */
function dynamicHelpers(req, res, next) {
	res.locals({
		session: req.session,
		flash: req.flash()
	});
	next();
}

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
			  store: sessionStore
			, key: sessionKey
		}));
		app.use(flash());
		app.use(dynamicHelpers);
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
			var cookie = nodeCookie.parse(data.headers.cookie);
			var signedCookie = utils.parseSignedCookies(cookie, cookieSecret);

			data.sessionID = signedCookie[sessionKey];
			
			if (!data.sessionID)
				return callback('SIDs don\'t match', false);
			
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
