var fs = require('fs');
var async = require('async');
var _ = require('underscore');

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
			console.log(err);
			callback(null);
			return;
		}
		
		callback(true);
	});
}

function list(callback) {
	fs.readdir('./store', function(err, directories) {
		if (err) {
			console.log('problem reading store directory');
			callback(null);
			return;
		}

		var filesList = [];

		function readStoreDir(dir, callback) {
			fs.readdir('./store/' + dir, function(err, files) {
				if (err) {
					console.log('problem reading store/%s directory', dir);
					callback(err);
					return;
				}

				if (_.isEmpty(files)) return callback();

				var filteredFiles = _.map(files, function(fileName) {
					return dir + '/' + fileName.split('.')[0];
				});

				filesList.push(_.uniq(filteredFiles));

				callback();
			});
		}

		async.forEach(directories, readStoreDir, function(err) {
			callback(filesList);
		});
	});
}

module.exports = {
	list: list,
	exportSeq: exportSequencer,
	importSeq: importSequencer
}
