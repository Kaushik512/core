var fs = require('fs');


module.exports.validateFilePath = function(rootPath, path) {



}

module.exports.readDir = function(root, path, callback) {
	var dirList = [];
	var filesList = [];
	var totalItems = 0;
	var that = this;
	fs.readdir(root + path, function(err, files) {
		if (err) {
			callback(err);
			return;
		}
		var fileStatError = false;
		totalItems = files.length;
		for (var i = 0; i < totalItems; i++) {
			var file = files[i];
			(function(file) {
				fs.stat(root + path + '/' + file, function(err, stats) {
					totalItems--;
					if (err) {
						fileStatError = true;
						callback(err);
						return;
					}

					var itemPath = path + '/' + file;
					if (stats.isDirectory()) {
						dirList.push({
							fullPath: itemPath,
							name: file
						});
					} else {
						filesList.push({
							fullPath: itemPath,
							name: file
						});
					}
					if (totalItems < 1) {
						callback(null, dirList, filesList);
					}

				});
			})(file);
			if (fileStatError) {
				break;
			}
		}
	})
}

module.exports.isDir = function(path, callback) {
	fs.stat(path, function(err, stats) {
		if (err) {
			callback(err);
			return;
		}
		if (stats.isDirectory()) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	});
}

module.exports.readFile = function(path, callback) {
	fs.readFile(path, function(err, fileData) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, fileData);
	})
}

module.exports.writeFile = function(path, data,encoding,callback) {
    var options = {};
    if(encoding) {
      options.encoding = encoding;
    }
	fs.writeFile(path, data,options, function(err) {
		if (err) {
			callback(err);
			return;
		}
		callback(null);
	});
}

module.exports.exists = function(path,callback) {
  fs.exists(path, function(exists) {
    if (exists) {
       callback(exists);
    } else {
    	callback(false);
    }
});
}

module.exports.mkdir = function(path,callback) {
	fs.mkdir(path,function(err) {
		if(err) {
			callback(err);
		} else {
			callback(null);
		}
	});
}