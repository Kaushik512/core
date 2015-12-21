/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var scpClient = require('scp2');
var fileIo = require('./fileio');


var HOST_UNREACHABLE = -5000;
var INVALID_CREDENTIALS = -5001;
var JSCH_EXCEPTION = -5002;
var UNKOWN_EXCEPTION = -5003;
var PEM_FILE_READ_ERROR = -5004;
var STREAM_ERROR = -5005;



function getErrorObj(err, errCode) {
    return {
        err: err,
        errCode: errCode
    }
};

function getConnectionParams(options, callback) {
    var connectionParamsObj = {
        host: options.host,
        port: options.port,
        username: options.username

    };
    if (options.passphrase) {
        connectionParamsObj.passphrase = options.passphrase;
    }
    if (options.privateKey) {

        fileIo.readFile(options.privateKey, function(err, key) {
            if (err) {
                callback(getErrorObj(err, PEM_FILE_READ_ERROR), null);
                return;
            }
            connectionParamsObj.privateKey = key;
            callback(null, connectionParamsObj);
        });
    } else {
        if (options.pemFileData) {
            connectionParamsObj.privateKey = options.pemFileData;
        } else {
            connectionParamsObj.password = options.password;
        }
        process.nextTick(function() {
            callback(null, connectionParamsObj);
        });
    }
}



module.exports = function(options) {
    var connectionParamsObj = null;

    function initializeParams(callback) {
      
        if (!connectionParamsObj) {
            getConnectionParams(options, function(err, connectionParams) {
                if (err) {
                    callback(err, null);
                    return;
                }
                connectionParamsObj = connectionParams;
                callback(null, connectionParamsObj);
            });
        } else {
            process.nextTick(function() {
                callback(null, connectionParamsObj);
            });
        }
    }

    this.createDir = function(path, callback) {
        initializeParams(function(err, connectionParamsObj) {
            if (err) {
                callback(err, null);
                return;
            }
            var client = new scpClient.Client(connectionParamsObj);
            client.mkdir(path, function(err) {
                client.close();
                callback(err);
            });
        });
    };

    this.upload = function(srcPath, destPath, callback) {
        initializeParams(function(err, connectionParamsObj) {
            if (err) {
                callback(err, null);
                return;
            }
            connectionParamsObj.path = destPath;
            scpClient.scp(srcPath, connectionParamsObj, function(err) {
            	logger.debug('here ===> ');
                callback(err);
            });

        });
    };
};