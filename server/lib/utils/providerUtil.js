var logger = require('../../lib/logger')(module);
var currentDirectory = __dirname;
var fs = require('fs');
var path = require('path');

// saveAwsPemFiles() capture all uploaded files from request and save.
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(keyPair,req,callback){
		var pemFileLocation= currentDirectory + '/../../catdata/catalyst/provider-pemfiles';
		
		// Check the directory already exist or not.
		path.exists(pemFileLocation,function(exists){
			if(exists){
				logger.debug("Directory already exists.");
				var myFiles = req.files;
		        for(var i in myFiles){
		            logger.debug("Incomming files: ",JSON.stringify(myFiles[i]));
		        }
		        fs.readFile(req.files.fileName.path, function (err, data) {
		        	if(err){
		        		logger.debug("File not found in specified path.");
		        		callback(err,null);
		        	}
		        	var pathNew = pemFileLocation + keyPair._id + path.extname(req.files.fileName.name)

			        fs.writeFile(pathNew, data, function (err) {
			            console.log('uploaded', pathNew);
			            if(err){
			            	callback(err,null);
			           	}
			        });
		    	});
			}else{

				// If directory does not exist,then create.
				fs.mkdir(pemFileLocation, function(error) {
				if(error){
					logger.debug("Error happen while creating directory.");
					}
					var myFiles = req.files;
		        for(var i in myFiles){
		            logger.debug("Incomming files: ",JSON.stringify(myFiles[i]));
		        }
		        fs.readFile(req.files.fileName.path, function (err, data) {
		        var pathNew = pemFileLocation + keyPair._id + path.extname(req.files.fileName.name)

		        fs.writeFile(pathNew, data, function (err) {
		            console.log('uploaded', pathNew);
		            if(err){
		            	callback(err,null);
		            }
		        		});
		    		});
				});
			}
		});
			
		callback(null,true);
	}
}

module.exports = new ProviderUtil();