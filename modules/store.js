var fs = require('fs');
var _ = require('underscore');

function checkStoreExistence(next) {
	fs.stat('./store', function(err, stats) {
		if (err || !stats.isDirectory()) {
			fs.mkdir('store', function() {
				next();
			});
		} else next();
	});
}

function importSequencer(fileName, callback) {
	var pathName = 'store/' + fileName;
	
	fs.readFile(pathName, function(err, data) {
		if (err) {
			callback(null);
			return;
		}
		
		var sequencer = JSON.parse(data);
		
		callback(sequencer);
	});
}

function exportSequencer(fileName, data, callback) {
	var pathName = 'store/' + fileName,
		serializedData = JSON.stringify(data);
	
	fs.writeFile(pathName, serializedData, function(err) {
		if (err) {
			callback(null);
			return;
		}
		
		callback(true);
	});
}

function list(callback) {
	fs.readdir('./store', function(err, files) {
		if (err) {
			console.log('problem reading directory');
			callback(null);
			return;
		}
		
		var filteredFiles = _.map(files, function(fileName) {
			return fileName.split('.')[0];
		});
		
		callback(_.uniq(filteredFiles));
	});
}

module.exports = {
	list: function(callback) {
		checkStoreExistence(function() {
			list(callback);
		});
	},
	exportSeq: function(fileName, data, callback) {
		checkStoreExistence(function() {
			exportSequencer(fileName, data, callback);
		});
	},
	importSeq: function(fileName, callback) {
		checkStoreExistence(function() {
			importSequencer(fileName, callback);
		});
	}
}
