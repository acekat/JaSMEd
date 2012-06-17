## JaSMEd

### Configuration & Dependencies

JaSMEd's back-end runs on [node.js](https://github.com/joyent/node/wiki/Installation) *(>= v0.6.12)* and uses [Redis](http://redis.io/topics/quickstart) for session storage.
Both need to be installed in order to run the JaSMEd server.

Right now, JaSMEd is only fully compatible with a recent version of [Google Chrome](https://www.google.com/chrome).
Other browsers implementing the webAudio spec should also work but we haven't tested them yet.

### Running JaSMEd

First, clone a copy of the master repo

```bash
git clone -b master git://github.com/Acekat/JaSMEd.git
```

Enter the directory and make sure all dependencies are installed

```bash
cd JaSMEd && npm install
```

Make sure a Redis server is running

```bash
/path/to/redis redis-server
```

Start the server

```bash
npm start
```

The default port is 3000, so you can now try JaSMEd out at [localhost:3000](http://localhost:3000).

### Authentification

JaSMEd is still in beta-alpha-you-name-it so currently the only way of signing-in is to use the default hard-coded accounts:
	
-	thibaud
-	grizix
-	jaimito
-	acekat
-	berthou
-	esj
	
Password is `pwd` for all logins.
