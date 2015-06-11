var fileIo = require('./fileio');
var sshConnection = require('ssh2').Client;

var HOST_UNREACHABLE = -5000;
var INVALID_CREDENTIALS = -5001;
var JSCH_EXCEPTION = -5002;
var UNKOWN_EXCEPTION = -5003;
var PEM_FILE_READ_ERROR = -5004;

module.exports = function(options) {

    var con;
    var isConnected = false;

    function connect(connectionParamsObj, callback) {
        con = new sshConnection();
        console.log("ConnectionParamsObj==>", connectionParamsObj);

        try {
            con.connect(connectionParamsObj);
        } catch (connectErr) {
            console.log('errrroroorooror == >catch ==>', connectErr.message);
            con = null;
            // a hack to make a sycnronous call asynchronous 
            setTimeout(function() {
                if (connectErr.message === 'Cannot parse privateKey: Unsupported key format') {
                    console.log('Invalid Credentioals firing');
                    callback(connectErr, INVALID_CREDENTIALS);
                } else {
                    callback(connectErr, UNKOWN_EXCEPTION);
                }
            }, 2000);
            return;
        }

        con.on('ready', function() {
            console.log("connected to ==>", connectionParamsObj.host);
            isConnected = true;
            callback(null);
        });

        con.on('error', function(err) {
            isConnected = false;
            con = null;
            console.log('ssh error ', err);
            console.log('keys ==>', Object.keys(err));

            if (err.level === 'client-authentication') {

                callback(err, INVALID_CREDENTIALS);
            } else if (err.level === 'client-timeout') {
                callback(err, HOST_UNREACHABLE);
            } else {
                callback(err, UNKOWN_EXCEPTION);
            }


        });

        con.on('close', function(hadError) {
            isConnected = false;
            con = null;
            console.log('ssh close ', hadError);

        });

        con.on('end', function() {
            isConnected = false;
            con = null;
            console.log('ssh end');
        });

    }

    function initialize(callback) {
        if (!con) {
            var connectionParamsObj = {
                host: options.host,
                port: options.port,
                username: options.username

            };

            if (options.privateKey) {
                if (options.passphrase) {
                    connectionParamsObj.passphrase = options.passphrase;
                }
                fileIo.readFile(options.privateKey, function(err, key) {
                    if (err) {
                        callback(err, PEM_FILE_READ_ERROR);
                        return;
                    }
                    connectionParamsObj.privateKey = 'sdfsdf'; //key;
                    connect(connectionParamsObj, callback);
                });
            } else {
                connectionParamsObj.password = options.password;
                connect(connectionParamsObj, callback);
            }
        } else {
            callback(null);
        }
    }


    this.exec = function(cmd, onComplete, onStdOut, onStdErr) {
        var execRetCode = null;
        var execSignal = null;
        initialize(function(err, initErrorCode) {
            if (err) {
                onComplete(null, initErrorCode);
                return;
            }
            if (con) {
                console.log('executing cmd');
                con.exec(cmd, {
                    pty: true
                }, function(err, stream) {
                    if (err) {
                        onComplete(err, -1);
                        return;
                    }
                    stream.on('exit', function(code, signal) {
                        console.log('SSH STREAM EXIT: ' + code + '  ==== ', signal);
                        execRetCode = code;
                        execSignal = signal;

                    });

                    stream.on('close', function() {
                        console.log('SSH STREAM CLOSE');
                        if (con) {
                            con.end();
                        }
                        if (execRetCode !== null) {
                            onComplete(null, execRetCode);
                        } else {
                            onComplete({
                                err: "cmd exit error"
                            }, -1);
                        }
                    });


                    if (typeof onStdOut === 'function') {
                        stream.on('data', function(data) {
                            // console.log('SSH STDOUT: ' + data);
                            onStdOut(data);
                        })
                    }

                    if (typeof onStdErr === 'function') {
                        stream.stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                            onStdErr(data);
                        });
                    }
                });
            } else {
                onComplete({
                    err: "Connection not initialized"
                }, -1);
            }

        });

    }
}