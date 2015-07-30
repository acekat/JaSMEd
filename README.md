# JaSMEd

## Configuration & Dependencies

JaSMEd's back-end runs on [node.js](https://github.com/joyent/node/wiki/Installation) and uses [Redis](http://redis.io/topics/quickstart) for session storage.
Both need to be installed in order to run the JaSMEd server.

Right now, JaSMEd is only fully compatible with a recent version of [Google Chrome](https://www.google.com/chrome).
Other browsers implementing the webAudio spec should also work but we haven't tested them yet.

## Running JaSMEd

First, clone a copy of the master repo
```bash
git clone -b master git://github.com/Acekat/JaSMEd.git
```

Enter the directory and make sure all dependencies are installed
```bash
cd JaSMEd && npm install
```
_option `--unsafe-perm` may be needed if installation warns on post-install script_ 

Make sure a Redis server is running
```bash
redis-server
```

Start JaSMEd server
```bash
npm start
```

The default port is 3000, so you can now try JaSMEd out at [localhost:3000](http://localhost:3000).

## Authentification

JaSMEd is still in beta-alpha-you-name-it so currently the only way of signing-in is to use the default hard-coded accounts:
- thibaud
- grizix
- jaimito
- acekat
- berthou
- esj
	
Password is `pwd` for all logins.

## License

Licensed under the MIT License

Copyright (C) 2012

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
