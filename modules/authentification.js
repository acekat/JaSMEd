var users = {
	    'thibaud': {
	        login: 'thibaud'
	      , password: 'pwd'
	    }
	  ,	'jaimito': {
	        login: 'jaimito'
	      , password: 'pwd'
	    }
	  , 'grizix': {
	        login: 'grizix'
	      , password: 'pwd'
	    }
	  , 'acekat': {
	        login: 'acekat'
	      , password: 'pwd'
	    }
	  , 'berthou': {
	        login: 'berthou'
	      , password: 'pwd'
	    }
	  , 'esj': {
	      login: 'esj'
	    , password: 'pwd'
	  }
};

module.exports.authenticate = function(login, password, callback) {
	var user = users[login];
	
	if (!user)
	  return callback(null);

	if (user.password == password)
	  return callback(user);

	callback(null);
};
