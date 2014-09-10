var fileIo = require('./fileio');
var sshConnection = require('ssh2');



module.exports = function(options) {

    var con;
    var isConnected = false;

    function connect(connectionParamsObj, callback) {
        con = new sshConnection();
        con.connect(connectionParamsObj);
        con.on('ready', function() {
            isConnected = true;
            callback(null);
        });

        con.on('error', function(err) {
            isConnected = false;
            con = null;
            console.log('ssh error', err);
            callback(err);
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
                        callback(err, null);
                        return;
                    }
                    connectionParamsObj.privateKey = key;
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
        initialize(function(err) {
            if (err) {
                onComplete(err, -1);
                return;
            }
            if (con) {
                con.exec(cmd, function(err, stream) {
                    if (err) {
                        onComplete(err, -1);
                        return;
                    }
                    stream.on('exit', function(code, signal) {
                        console.log('SSH STREAM EXIT: ' + code + '  ==== ',signal);
                        onComplete(null, code);
                    });
                    if (typeof onStdOut === 'function') {
                        stream.on('data', function(data) {
                            console.log('SSH STDOUT: ' + data);
                            onStdOut(data);
                        })
                    }

                    if (typeof onStdErr === 'function') {
                        stream.stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                            onStdErr(onStdErr);
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