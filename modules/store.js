var fs = require('fs');

function importSequencer(fileName, callback) {
	var pathName = 'store/' + fileName;
	
	// console.log('about to open ' +  pathName);
	
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
			console.err('problem reading directory');
			return;
		}

		callback(files);
	})
}

module.exports = {
	list: list,
	exportSeq: exportSequencer,
	importSeq: importSequencer
}
