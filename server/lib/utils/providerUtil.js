var logger = require('../../lib/logger')(module);
var currentDirectory = __dirname;
var fs = require('fs');
var path = require('path');
var appConfig = require('../../config/app_config');

// saveAwsPemFiles() capture all uploaded files from request and save.
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(keyPair,inFiles,callback){
		var pemFileLocation= appConfig.instancePemFilesDir + keyPair._id;
		//var pemCreateFileLocation= currentDirectory + '/../../catdata/catalyst';
		console.log("inFiles>>>>> "+inFiles.fileObject);
		// Check the directory already exist or not.
		//path.exists(pemFileLocation,function(exists){
			//if(exists){
				logger.debug("Directory already exists.");
				/*var myFiles = req.files;
		        for(var i=0;i< myFiles.length;i++){
		            logger.debug("Incomming files: ",JSON.stringify(myFiles[i]));
		        }*/
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
			//}else{

					// If directory does not exist,then create.
					/**fs.mkdir(pemFileLocation, function(error) {
					if(error){
						logger.debug("Error happen while creating directory.");
						}
						
				        fs.readFile(inFiles.fileObject.path, function (err, data) {
				        var pathNew = pemFileLocation + keyPair._id + path.extname(inFiles.fileObject.name)

				        fs.writeFile(pathNew, data, function (err) {
				            console.log('uploaded', pathNew);
				            if(err){
				            	callback(err,null);
				            	}
				        	});
				    	});
					});
			}*/
		//});
			
		callback(null,true);
	}
}

module.exports = new ProviderUtil();