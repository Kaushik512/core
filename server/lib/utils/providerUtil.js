/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Util class which contains provider related util methods.

var logger = require('_pr/logger')(module);
var currentDirectory = __dirname;
var fs = require('fs');
var path = require('path');
var appConfig = require('_pr/config');
var Cryptography = require('../../lib/utils/cryptography');

// saveAwsPemFiles() capture all uploaded files from request and save.
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(keyPair,inFiles,callback){
		logger.debug("Path: ",inFiles);
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