var logger = require('../../lib/logger')(module);
var currentDirectory = __dirname;
var fs = require('fs');
var path = require('path');
var appConfig = require('../../config/app_config');

// saveAwsPemFiles() capture all uploaded files from request and save.
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(keyPair,inFiles,callback){
		var pemFileLocation= appConfig.instancePemFilesDir + keyPair._id;
		fs.readFile(inFiles.fileObject.path, function (err, data) {
			if(err){
				logger.debug("File not found in specified path.");
				callback(err,null);
			}
			var pathNew = pemFileLocation;

			fs.writeFile(pathNew, data, function (err) {
				console.log('uploaded', pathNew);
				if(err){
					callback(err,null);
				}
			});
		});
		callback(null,true);
	}
}

module.exports = new ProviderUtil();