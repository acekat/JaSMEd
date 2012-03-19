//module perso...
//ne sera disponible aux autres modules seul ce qui est définit par 'module.exports.X'

var users = {
	'thibaud' : {login: 'thibaud', password: 'pwd'},
	'jaimito' : {login: 'jaimito', password: 'pwd'},
	'grizix' : {login: 'grizix', password: 'pwd'},
	'acekat' : {login: 'acekat', password: 'pwd'}
};

module.exports.authenticate = function(login, password, callback) {
	var user = users[login];
	
	if (!user) {
		callback(null);
		return;
	}

	if (user.password == password) {
		callback(user);
		return;
	}

	callback(null);
};
