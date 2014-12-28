var java = require('java');
var Tail = require('tail').Tail;
var appConfig = require('../config/app_config');
var nodeExtend = require('node.extend');
var uuid = require('node-uuid');
var fs = require('fs');

java.classpath.push('../java/lib/jsch-0.1.51.jar');
java.classpath.push('/home/anshul/eclipse-workspace/catalyst-ssh/bin');


var defaults = {
    port: 22,
    tempDir: appConfig.tempDir
};



function LogFileTail(logFile, onChangeCallback) {
    var tail = new Tail("fileToTail");

    tail.on("line", function(data) {
        onChangeCallback(data);
    });

    this.stopTailing = function() {
        tail.unwatch();
    }
};


function JavaSSH(javaSSHInstance, options) {

    this.execChefClient = function(runlist, overrideRunlist, onComplete, onStdOut, onStdErr) {
        var stdOutLogFile = options.tempDir + uuid.v4();
        var stdErrLogFile = options.tempDir + uuid.v4();
        var tailStdOut = null;
        var tailStdErr = null;
        fs.open(stdOutLogFile, 'w', function(err, fd1) {
            if (err) {
                if (typeof onComplete === 'function') {
                    onComplete(err, null);
                }
                return;
            }
            fs.close(fd1);
            fs.open(stdErrLogFile, 'w', function(err, fd2) {
                if (err) {
                    if (typeof onComplete === 'function') {
                        onComplete(err, null);
                    }
                    return;
                }
                fs.close(fd2);
                if (typeof onStdOut === 'function') {
                    tailStdOut = new LogFileTail(stdOutLogFile, onStdOut);
                }
                if (typeof onStdErr === 'function') {
                    tailStdErr = new LogFileTail(stdErrLogFile, onStdErr);
                }

                java.callMethod(javaSSHInstance, 'execChefClient', runlist, overrideRunlist, stdOutLogFile, stdErrLogFile, function(err, retCode) {
                    // deleting log files
                    fs.unlink(stdOutLogFile);
                    fs.unlink(stdErrLogFile);
                    if (err) {
                        console.log("error in runnnig method");
                        console.log(err);
                        if (typeof onComplete === 'function') {
                            onComplete(err, null);
                        }
                        return;
                    }
                    if (typeof onComplete === 'function') {
                        onComplete(err, null);
                    }
                });
            });

        });

    };

    this.runServiceCmd = function(serviceName, servicAction, onComplete, onStdOut, onStdErr) {
        var stdOutLogFile = options.tempDir + uuid.v4();
        var stdErrLogFile = options.tempDir + uuid.v4();
        var tailStdOut = null;
        var tailStdErr = null;
        fs.open(stdOutLogFile, 'w', function(err, fd1) {
            if (err) {
                if (typeof onComplete === 'function') {
                    onComplete(err, null);
                }
                return;
            }
            fs.close(fd1);
            fs.open(stdErrLogFile, 'w', function(err, fd2) {
                if (err) {
                    if (typeof onComplete === 'function') {
                        onComplete(err, null);
                    }
                    return;
                }
                fs.close(fd2);
                if (typeof onStdOut === 'function') {
                    tailStdOut = new LogFileTail(stdOutLogFile, onStdOut);
                }
                if (typeof onStdErr === 'function') {
                    tailStdErr = new LogFileTail(stdErrLogFile, onStdErr);
                }

                java.callMethod(javaSSHInstance, 'execServiceCmd', serviceName, servicAction, stdOutLogFile, stdErrLogFile, function(err, retCode) {
                    // deleting log files
                    fs.unlink(stdOutLogFile);
                    fs.unlink(stdErrLogFile);
                    if (err) {
                        console.log("error in runnnig method");
                        console.log(err);
                        if (typeof onComplete === 'function') {
                            onComplete(err, null);
                        }
                        return;
                    }
                    if (typeof onComplete === 'function') {
                        onComplete(err, null);
                    }
                });
            });

        });
    };
}


module.exports.getNewInstance = function(options, callback) {
    options = nodeExtend(defaults, options);
    if (options.password) {
        options.pemFilePath = null;
    } else {
        options.password = null;
    }

    java.newInstance('com.relevancelab.catalyst.security.ssh.SSH', options.host, options.port, options.username, options.password, options.pemFilePath, function(err, javaSSHInstance) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        var javaSSH = new JavaSSH(javaSSHInstance, options);
        callback(null, JavaSSH);
    });

}