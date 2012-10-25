var nodeCookie = require('express/node_modules/cookie')
  , stylus = require('stylus')
  , flash = require('connect-flash')
  , signature = require('cookie-signature')
  , sessionSecret = 'whambaamthankyoumaaammm!'
  , sessionKey = 'JaSMEd.sid'

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
    app.use(express.cookieParser());
    app.use(express.session({
        store: sessionStore
      , key: sessionKey
      , secret: sessionSecret
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
    io.set('authorization', function(handshakeData, callback) {
      /* exposing session and sessionID to handshakeData so can be used by sio */
      if (!handshakeData.headers.cookie)
        return callback('No cookie', false);
      
      var cookie = nodeCookie.parse(handshakeData.headers.cookie);
      var signedSessionID = cookie[sessionKey];
      var sessionID = signature.unsign(signedSessionID.slice(2), sessionSecret);

      if (!sessionID)
        return callback('SIDs don\'t match', false);

      sessionStore.get(sessionID, function(err, session) {
        if (err || !session)
          return callback('Error loading session', false);

        handshakeData.session = session;
        
        return callback(null, true);
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
