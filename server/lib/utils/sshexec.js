var fileIo = require('./fileio');
var extend = require('extend');
var sshConnection = require('ssh2').Client;

var HOST_UNREACHABLE = -5000;
var INVALID_CREDENTIALS = -5001;
var JSCH_EXCEPTION = -5002;
var UNKOWN_EXCEPTION = -5003;
var PEM_FILE_READ_ERROR = -5004;
var CONNECTION_NOT_INITIALIZED = -5005;


module.exports = function(opts) {
    var options = extend({}, opts);
    var sshTry = 0;
    //var con;
    var isConnected = false;

    function connect(connectionParamsObj, callback) {
        var con = new sshConnection();
        console.log("ConnectionParamsObj==>", connectionParamsObj);

        try {
            con.connect(connectionParamsObj);
        } catch (connectErr) {
            con = null;
            console.log(connectErr);
            // a hack to make a sycnronous call asynchronous 
            process.nextTick(function() {
                if (connectErr.message === 'Cannot parse privateKey: Unsupported key format') {
                    console.log('Error msg:' + connectErr.message);
                    callback(connectErr, INVALID_CREDENTIALS, null);
                } else {
                    callback(connectErr, UNKOWN_EXCEPTION, null);
                }
            });
            return;
        }

        con.on('ready', function() {
            isConnected = true;
            callback(null,null,con);
        });

        con.on('error', function(err) {
            isConnected = false;
            con = null;
            console.log("ERROR EVENT FIRED", err);
            if (err.level === 'client-authentication') {
                console.log('Error msg:' + err);
                callback(err, INVALID_CREDENTIALS,null);
            } else if (err.level === 'client-timeout') {
                callback(err, HOST_UNREACHABLE,null);
            } else {
                callback(err, UNKOWN_EXCEPTION,null);
            }
            console.log('ssh error');
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

        con.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish) {
            console.log('Connection :: keyboard-interactive');
            finish([options.password]);
        });

    }

    function initializeConnection(callback) {
        console.log("In SSH Initilize");
        //console.log('con ..>', con);
        //if (!con) {
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
                    connectionParamsObj.privateKey = key;
                    connect(connectionParamsObj, callback);
                });
            } else {
                console.log("SSh password...");

                if (options.interactiveKeyboard) {
                    connectionParamsObj.tryKeyboard = true;
                    connect(connectionParamsObj, callback);
                } else {
                    connectionParamsObj.password = options.password;
                    connect(connectionParamsObj, callback);
                }
            }
        /*} else {
            process.nextTick(function() {
                callback(null);
            });
        }*/
    }


    this.exec = function(cmd, onComplete, onStdOut, onStdErr) {
        console.log("sshTry:", sshTry);
        sshTry++;
        var self = this;
        var execRetCode = null;
        var execSignal = null;
        console.log('in exec: ' + cmd);
        initializeConnection(function(err, initErrorCode, con) {
            if (err) {
                if (initErrorCode === -5001 && sshTry === 1) {
                    options.interactiveKeyboard = true;
                    con = null;
                    isConnected = false;
                    console.log('firing again');
                    self.exec(cmd, onComplete, onStdOut, onStdErr);
                } else {
                    onComplete(null, initErrorCode);
                }
                return;
            }
            if (con) {
                console.log('executing cmd: ' + cmd);
                con.exec('' + cmd, {
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

                    stream.on('close', function(code, signal) {
                        console.log('SSH STREAM CLOSE');
                        if (con) {
                            con.end();
                        }
                        if (execRetCode !== null) {
                            onComplete(null, execRetCode);
                        } else {
                            if (typeof code !== 'undefined' && typeof code === 'number') {
                                execRetCode = code;
                                execSignal = signal;
                            } else {
                                execRetCode = UNKOWN_EXCEPTION;
                                execSignal = null;
                            }
                            onComplete(null, execRetCode);
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
                console.log('con is null');
                onComplete(null, CONNECTION_NOT_INITIALIZED);
            }

        });

    }
}