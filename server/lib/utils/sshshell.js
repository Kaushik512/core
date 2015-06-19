var fileIo = require('./fileio');
var sshConnection = require('ssh2').Client;
var EventEmitter = require('events').EventEmitter;
var util = require("util");



var HOST_UNREACHABLE = -5000;
var INVALID_CREDENTIALS = -5001;
var JSCH_EXCEPTION = -5002;
var UNKOWN_EXCEPTION = -5003;
var PEM_FILE_READ_ERROR = -5004;
var STREAM_ERROR = -5005;

var EVENTS = {
    ERROR: 'error',
    CLOSE: 'close',
    END: 'end',
    READY: 'ready',
    DATA: 'data',
};


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

function SSHShell(connectionParamsObj) {
    EventEmitter.call(this);
    var self = this;
    var connection = null;
    connection = new sshConnection();
    var sshStream = null;
    connection.on('ready', function() {
        connection.shell(function(err, stream) {
            if (err) {
                self.emit(EVENTS.ERROR, getErrorObj(err, STREAM_ERROR));
                return;
            }
            sshStream = stream;
            stream.on('close', function() {
                if (connection) {
                    connection.end();
                }
            }).on('data', function(data) {
                self.emit(EVENTS.DATA, data.toString('utf8'));
            }).stderr.on('data', function(data) {
                self.emit(EVENTS.DATA, data);
            });
            self.emit(EVENTS.READY);
        });
    });
    connection.on('error', function(err) {
        console.log("ERRROR ==> EVENT FIRED");
        var errObj = null;
        if (err.level === 'client-authentication') {
            errObj = getErrorObj(err, INVALID_CREDENTIALS);
        } else if (err.level === 'client-timeout') {

            errObj = getErrorObj(err, HOST_UNREACHABLE);
        } else {
            errObj = getErrorObj(err, UNKOWN_EXCEPTION);
        }
        self.emit(EVENTS.ERROR, errObj);
    });

    connection.on('close', function(hadError) {
        console.log('Connection closed');
        sshStream = null;
        connection = null;
        self.emit(EVENTS.CLOSE);
    });

    connection.on('end', function() {
        console.log('Connection ended');
        sshStream = null;
        connection = null;
        self.emit(EVENTS.END);
    });
    try {
        connection.connect(connectionParamsObj);
    } catch (connectErr) {
        var errObj = null;
        if (connectErr.message === 'Cannot parse privateKey: Unsupported key format') {
            errObj = getErrorObj(err, INVALID_CREDENTIALS);
        } else {
            errObj = getErrorObj(err, UNKOWN_EXCEPTION);
        }
        process.nextTick(function() {
            self.emit(EVENTS.ERROR, errObj);
        });

    }
    this.write = function(data) {
        if (sshStream) {
            sshStream.write(data);
        }
    };
    this.close = function() {
        console.log('Closing Connection');
        if (connection) {
            connection.end();
        }
    };
}

util.inherits(SSHShell, EventEmitter);

module.exports.open = function(options, callback) {
    getConnectionParams(options, function(err, connectionParamsObj) {
        if (err) {
            callback(err, null);
            return;
        }
        var shell = new SSHShell(connectionParamsObj);
        shell.on(EVENTS.ERROR, function(errObj) {
            callback(errObj, null);
        });

        shell.on(EVENTS.READY, function() {
            callback(null, shell);
        })
    });
};