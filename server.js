var express = require('express')
  , http = require('http')
  , socketIO = require('socket.io')
  , _ = require('underscore')
  , auth = require('./modules/authentification')
  , store = require('./modules/store');

var app = express()
  , server = http.createServer(app)
  , io = socketIO.listen(server)
  , sessionStore;

// config
require('./config')(app, express, io, sessionStore);

/** 
 * Middleware for limited access 
 */
function requireLogin(req, res, next) {
  if (req.session.login) {
    // User is authenticated, let him in
    next();
  } else {
    // Otherwise, we redirect him to login form
    req.flash('warn', 'login needz yo!!');
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
  // need to only allow 1 sessionID
  auth.authenticate(req.body.username, req.body.password, function(user) {
    if (user) {
      req.session.login = user.login;
      var redir = req.session.redir || '/';
      delete req.session.redir;
      res.redirect(redir);
    } else {
      req.flash('warn', 'tough luck, login failed brother');
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

var users = ['thibaud', 'jaimito', 'grizix', 'acekat', 'berthou', 'esj'];

_.each(users, function(user) {
  app.get('/store/' + user + '/:name', requireLogin, function(req, res) {
    res.render('app');
  });
});

/**
 * socket.io
 */
var namespaces = {} //object that'l store all namespaces...
  , connections = {}; //object to store connect count (if user has multiple tabs)

function addNewNamespace(name) {
  namespaces[name] = io.of('/' + name);
  namespaces[name].on('connection', realTime);
  console.log('added', name, 'namespace');
}

//main namespace
addNewNamespace('app');

//saved sequences namespaces
store.list(function(files) {
  _.each(files, function(fileName) {
    addNewNamespace(fileName);
  })
});


function realTime(socket) {
  var session = socket.handshake.session
    , sessionID = socket.handshake.sessionID;

  /* connexion management -> put in separte functions later */

  /**
   * CONNECTION
   */
  if (typeof connections[sessionID] == 'undefined')
    connections[sessionID] = { tabCount: 0 }; // first connection

  // add connection to pool
  connections[sessionID][socket.id] = socket;
  connections[sessionID].tabCount++;
  console.log(session.login, 'connecetd with', sessionID, 'connect count:', connections[sessionID].tabCount);

  /**
   * DISCONNECTION
   */
  socket.on('disconnect', function() {
    var user = connections[sessionID];

    if (user.tabCount && user[socket.id]) {
      // Forget this socket
      user.tabCount--;
      delete user[socket.id];
      console.log(session.login, 'disconnected with', sessionID, 'connect count:', user.tabCount);
    }

    // No more active sockets for this user
    if (user.tabCount === 0) {
      delete connections[sessionID];
      console.log(session.login, 'gone forreal');
      //socket.broadcast.emit('bye', session.login, Date.now());
    }
  });


  /**
   * APP
   */

  //do something better about that...
  socket.emit('serverLogin', session.login);

  socket.on('visualStructInit', function(seqName) {
    console.log('visualStructInit', seqName);
    if (!seqName) {
      socket.emit('serverInit');
      return;
    }

    var seqPath = seqName + '.visual';
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

  socket.on('musicalStructInit', function(seqName) {
    console.log('musicalStructInit', seqName);
    if (!seqName) {
      socket.emit('musicalStructServerInit');
      return;
    }

    var seqPath = seqName + '.musical';
    store.importSeq(seqPath, function(data) {
      if (!data) {
        console.log('error reading file');
        socket.emit('musicalStructServerInit'); //should send back an error to tell client file doesn't exist!!
        return;
      }

      // console.log('about to emit back: ' + session.seqName + ' + ' + JSON.stringify(data));
      socket.emit('musicalStructServerInit', {
        name: seqName,
        data: data
      });
    });
  });

  socket.on('visualStructExport', function(seq) {
    structureExport(seq, '.visual');
  });

  socket.on('musicalStructExport', function(seq) {
    structureExport(seq, '.musical');
  });

  socket.on('musicalStructSelection', function(selection) {
    console.log(selection.user + ' toggled a selection.'); //msg a ameliorer
    socket.broadcast.emit('serverSelection', selection);
  });

  socket.on('musicalStructNewBlock', function() {
    console.log("serverNewBlock broadcasted.");
    socket.broadcast.emit('serverNewBlock');
  });

  function structureExport(seq, suffix) {
    var seqName = session.login + '/' + seq.name
      , seqPath = seqName + suffix;

    //check if new namespace, if so add to namespaces...
    store.list(function(files) {
      if (!_.include(files, seqName))
        addNewNamespace(seqName);

      store.exportSeq(seqPath, seq.data, function(res) {
        if (!res)
          console.log(session.login + ' error trying to save sequencer');
        else
          console.log(session.login + ' saved current sequencer as ' + seqPath);
      });
    });
  }
}

/**
function musicalStructNewBlock() {
  var grid = editor.grid(name);
  var width = grid.last().refWidth;
  grid.add({
    width: width
  });
};

function musicalStructSelection(selection) {
  editor.grid(name).selectRange(selection);
};
*/

/**
 * start listening!
 */
server.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
