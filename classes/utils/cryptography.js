var crypto = require('crypto');
var fs = require('fs');

/**
 * Represents a Cryptography Module. This is used to encrypt or decrypt a string
 * 
 * @constructor
 */
function Cryptography(algorithm, password) {

   

    var encrypt = function(text, inputEncoding, outputEncoding) {
        var encryptedText;
        var cipher = crypto.createCipher(algorithm, password);
        encryptedText = cipher.update(text, 'ascii', 'base64');
        encryptedText += cipher.final('base64');
        return encryptedText;
    }

    var decrypt = function(text, inputEncoding, outputEncoding) {
        var decryptedText;
        var decipher = crypto.createDecipher(algorithm, password);
        decryptedText = decipher.update(text, 'base64', 'ascii');
        decryptedText += decipher.final('ascii');
        return decryptedText;
    }

    this.encryptText = function(text, inputEncoding, outputEncoding) {
        return encrypt(text, inputEncoding, outputEncoding);
    }

    this.encryptFile = function(inputFilePath, inputEncoding, outputFilepath, outputEncoding, callback) {
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            //console.log('pemfile == before ==>',fileData);
            var encryptedData = encrypt(fileData, inputEncoding, outputEncoding);
            //console.log('pemfile == after ==>',encryptedData);
            fs.writeFile(outputFilepath, encryptedData, {
                //encoding: outputEncoding
            }, function(err) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                    return;
                }
                callback(null);
            });
        });

    };

    this.decryptText = function(text, inputEncoding, outputEncoding) {
        return decrypt(text, inputEncoding, outputEncoding);

    };

    this.decryptFile = function(inputFilePath, inputEncoding, outputFilepath, outputEncoding, callback) {
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            var decryptData = decrypt(fileData, inputEncoding, outputEncoding);
             console.log('decrypted pemfile == after ==>',decryptData);
            fs.writeFile(outputFilepath, decryptData, {
                //encoding: outputEncoding
            }, function(err) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                    return;
                }
                callback(null);
            });
        });
    };

}


module.exports = Cryptography