var crypto = require('crypto');
var fs = require('fs');

/**
 * Represents a Cryptography Module. This is used to encrypt or decrypt a string
 * 
 * @constructor
 */
function Cryptography(algorithm, password) {

   

    var encrypt = function(text, encryptionEncoding, decryptionEncoding) {
        console.log(encryptionEncoding ," == ",decryptionEncoding);
        var encryptedText;
        var cipher = crypto.createCipher(algorithm, password);
        encryptedText = cipher.update(text, encryptionEncoding, decryptionEncoding);
        encryptedText += cipher.final(decryptionEncoding);
        return encryptedText;
    }

    var decrypt = function(text, decryptionEncoding, encryptionEncoding) {
        console.log(decryptionEncoding ," == ",encryptionEncoding);
        var decryptedText;
        var decipher = crypto.createDecipher(algorithm, password);
        decryptedText = decipher.update(text, decryptionEncoding, encryptionEncoding);
        decryptedText += decipher.final(encryptionEncoding);
        return decryptedText;
    }

    this.encryptText = function(text, encryptionEncoding, decryptionEncoding) {
        return encrypt(text, encryptionEncoding, decryptionEncoding);
    }

    this.encryptFile = function(inputFilePath, encryptionEncoding, outputFilepath, decryptionEncoding, callback) {
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            //console.log('pemfile == before ==>',fileData);
            var encryptedData = encrypt(fileData, encryptionEncoding, decryptionEncoding);
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

    this.decryptText = function(text, decryptionEncoding, encryptionEncoding) {
        return decrypt(text, decryptionEncoding, encryptionEncoding);

    };

    this.decryptFile = function(inputFilePath, decryptionEncoding, outputFilepath, encryptionEncoding, callback) {
        
        fs.readFile(inputFilePath, {
            encoding: 'ascii'
        }, function(err, fileData) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            var decryptData = decrypt(fileData, decryptionEncoding, encryptionEncoding);
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