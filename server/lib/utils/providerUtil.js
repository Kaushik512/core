var logger = require('../../lib/logger')(module);
var currentDirectory = __dirname;
var fs = require('fs');
var path = require('path');
var appConfig = require('../../config/app_config');
var Cryptography = require('../../lib/utils/cryptography');

// saveAwsPemFiles() capture all uploaded files from request and save.
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(keyPair,inFiles,callback){
		console.log("Path>>>>>>>>>> ",inFiles);
		var settings = appConfig;
        //encrypting default pem file
        var cryptoConfig = appConfig.cryptoSettings;
        var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
        var encryptedPemFileLocation = settings.instancePemFilesDir + keyPair._id;
		fs.readFile(inFiles.path, function (err, data) {
			if(err){
				logger.debug("File not found in specified path.");
				callback(err,null);
			}
			cryptography.encryptFile(inFiles.path, cryptoConfig.encryptionEncoding, encryptedPemFileLocation, cryptoConfig.decryptionEncoding, function(err) {
                 if (err) {
                   logger.log("encryptFile Failed >> ", err);
                   return;
                   }
                   logger.debug("Encryted Pemfile saved...");
			});
		});
		callback(null,true);
	}
}

module.exports = new ProviderUtil();