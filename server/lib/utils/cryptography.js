/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

/**
 * Represents a Cryptography Module. This is used to encrypt or decrypt a string
 * 
 * @constructor
 */

var crypto = require('crypto');
var fs = require('fs');
var logger = require('../../lib/logger')(module);

function Cryptography(algorithm, password) {

   

    var encrypt = function(text, encryptionEncoding, decryptionEncoding) {
        logger.debug(encryptionEncoding ," == ",decryptionEncoding);
        var encryptedText;
        var cipher = crypto.createCipher(algorithm, password);
        encryptedText = cipher.update(text, encryptionEncoding, decryptionEncoding);
        encryptedText += cipher.final(decryptionEncoding);
        return encryptedText;
    }

    var decrypt = function(text, decryptionEncoding, encryptionEncoding) {
        logger.debug(decryptionEncoding ," == ",encryptionEncoding);
        var decryptedText;
        var decipher = crypto.createDecipher(algorithm, password);
        decryptedText = decipher.update(text, decryptionEncoding, encryptionEncoding);
        decryptedText += decipher.final(encryptionEncoding);
        return decryptedText;
    }

    this.encryptText = function(text, encryptionEncoding, decryptionEncoding) {
        return encrypt(text, encryptionEncoding, decryptionEncoding);
    }

    this.encryptMultipleText = function(texts, encryptionEncoding, decryptionEncoding,callback) {
        var encryptedTexts =[];
        logger.debug("Keys: "+texts);
        for(var i=0;i<texts.length;i++){
            encryptedTexts.push(encrypt(texts[i], encryptionEncoding, decryptionEncoding));
        }
        logger.debug("EncryptedKeys: "+encryptedTexts);
       callback(null,encryptedTexts);
    }

    this.encryptFile = function(inputFilePath, encryptionEncoding, outputFilepath, decryptionEncoding, callback) {
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                logger.debug(err);
                callback(err);
                return;
            }
            //logger.debug('pemfile == before ==>',fileData);
            var encryptedData = encrypt(fileData, encryptionEncoding, decryptionEncoding);
            //logger.debug('pemfile == after ==>',encryptedData);
            fs.writeFile(outputFilepath, encryptedData, {
                //encoding: outputEncoding
            }, function(err) {
                if (err) {
                    logger.debug(err);
                    callback(err, null);
                    return;
                }
                callback(null);
            });
        });

    };

    this.decryptText = function(text, decryptionEncoding, encryptionEncoding) {
        return decrypt(text, decryptionEncoding, encryptionEncoding);

    };

    this.decryptMultipleText = function(texts, decryptionEncoding, encryptionEncoding,callback) {
        var decryptedTexts =[];
        logger.debug("Text for decrypt: "+texts);
        for(var i=0;i<texts.length;i++){
            decryptedTexts.push(decrypt(texts[i], decryptionEncoding, encryptionEncoding));
        }
        callback(null,decryptedTexts);
    }

    this.decryptFile = function(inputFilePath, decryptionEncoding, outputFilepath, encryptionEncoding, callback) {
        
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                logger.debug(err);
                callback(err);
                return;
            }
            var decryptData = decrypt(fileData, decryptionEncoding, encryptionEncoding);
            fs.writeFile(outputFilepath, decryptData, {
                //encoding: outputEncoding
            }, function(err) {
                if (err) {
                    logger.debug(err);
                    callback(err, null);
                    return;
                }
                callback(null);
            });
        });
    };

}


module.exports = Cryptography