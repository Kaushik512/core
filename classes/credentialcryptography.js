/*
This is a temproray class. these methods will me moved to model once mvc comes into picture
*/
var Cryptography = require('./utils/cryptography');
var appConfig = require('../config/app_config');
var uuid = require('node-uuid');
var fileIo = require('./utils/fileio');

module.exports.encryptCredential = function(credentials, callback) {
	console.log(credentials);
    var cryptoConfig = appConfig.cryptoSettings;
    var encryptedCredentials = {};

    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
    if (credentials) {
        encryptedCredentials.username = credentials.username;
        if (credentials.password) {
            encryptedCredentials.password = cryptography.encryptText(credentials.password, cryptoConfig.encryptionEncoding, cryptoConfig.decryptionEncoding);
            callback(null, encryptedCredentials);
        } else {
            var encryptedPemFileLocation = appConfig.instancePemFilesDir + uuid.v4();
            cryptography.encryptFile(credentials.pemFileLocation, cryptoConfig.encryptionEncoding, encryptedPemFileLocation, cryptoConfig.decryptionEncoding, function(err) {
                fileIo.removeFile(credentials.pemFileLocation, function(err) {
                    if (err) {
                        console.log("Unable to delete temp pem file =>", err);
                    } else {
                        console.log("temp pem file deleted =>");
                    }
                });

                if (err) {
                    callback(err, null);
                    return;
                }
                encryptedCredentials.pemFileLocation = encryptedPemFileLocation;
                callback(null, encryptedCredentials);
            });
        }

    }

};

module.exports.decryptCredential = function(credentials, callback) {
    var decryptedCredentials = {};
    decryptedCredentials.username = credentials.username;
    var cryptoConfig = appConfig.cryptoSettings;
    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

    if (credentials.pemFileLocation) {

        var tempUncryptedPemFileLoc = appConfig.tempDir + uuid.v4();

        cryptography.decryptFile(credentials.pemFileLocation, cryptoConfig.decryptionEncoding, tempUncryptedPemFileLoc, cryptoConfig.encryptionEncoding, function(err) {
            if (err) {
                console.log(err);
                callback(err, null);

            }
            decryptedCredentials.pemFileLocation = tempUncryptedPemFileLoc;
            callback(null, decryptedCredentials);
        });

    } else {
        decryptedCredentials.password = cryptography.decryptText(credentials.password, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding);
        callback(null, decryptedCredentials);
    }

};