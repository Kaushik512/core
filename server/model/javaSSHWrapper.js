var java = require('java');
var Tail = require('tail').Tail;
var appConfig = require('../config/app_config');
var extend = require('extend');
var uuid = require('node-uuid');
var fs = require('fs');

var currentDirectory = __dirname;

var indexOfSlash = currentDirectory.lastIndexOf("/");
if (indexOfSlash === -1) {
    indexOfSlash = currentDirectory.lastIndexOf("\\");
}
var D4DfolderPath = currentDirectory.substring(0, indexOfSlash + 1);



console.log(D4DfolderPath);
java.classpath.push(D4DfolderPath + '/java/lib/jsch-0.1.51.jar');
java.classpath.push(D4DfolderPath + '/java/classes');
//java.classpath.push('/home/anshul/eclipse-workspace/catalyst-ssh/bin');


var defaults = {
    port: 22,
    tempDir: appConfig.tempDir
};



function LogFileTail(logFile, onChangeCallback) {
    //var tail = new Tail('/home/anshul/test');
    var tail = new Tail(logFile);

    tail.on("line", function(data) {
        //console.log("FileData ==>", data);
        onChangeCallback(data);
    });
    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });

    this.stopTailing = function() {
        tail.unwatch();
    }
    this.startTailing = function() {
        tail.watch();
    }
};


function JavaSSH(javaSSHInstance, options) {

    /**
     * @param: runlist, chef runlist
     */
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
                    tailStdOut.startTailing();
                }
                if (typeof onStdErr === 'function') {
                    tailStdErr = new LogFileTail(stdErrLogFile, onStdErr);
                    tailStdErr.startTailing();
                }

                java.callMethod(javaSSHInstance, 'execChefClient', runlist, overrideRunlist, stdOutLogFile, stdErrLogFile, function(err, retCode) {
                    // deleting log files
                    if (tailStdOut) {
                        tailStdOut.stopTailing();
                        fs.unlink(stdOutLogFile);
                    }
                    if (tailStdErr) {
                        tailStdErr.stopTailing();
                        fs.unlink(stdErrLogFile);
                    }
                    if (err) {
                        console.log("error in runnnig method");
                        console.log(err);
                        if (typeof onComplete === 'function') {
                            onComplete(err, null);
                        }
                        return;
                    }
                    if (typeof onComplete === 'function') {
                        onComplete(err, retCode);
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
                    tailStdOut.startTailing();
                }
                if (typeof onStdErr === 'function') {
                    tailStdErr = new LogFileTail(stdErrLogFile, onStdErr);
                    tailStdErr.startTailing();
                }

                java.callMethod(javaSSHInstance, 'execServiceCmd', serviceName, servicAction, stdOutLogFile, stdErrLogFile, function(err, retCode) {
                    // deleting log files
                    if (tailStdOut) {
                        tailStdOut.stopTailing();
                        fs.unlink(stdOutLogFile);
                    }
                    if (tailStdErr) {
                        tailStdErr.stopTailing();
                        fs.unlink(stdErrLogFile);
                    }
                    if (err) {
                        console.log("error in runnnig method");
                        
                        console.log(err);
                        if (typeof onComplete === 'function') {
                            onComplete(err, null);
                        }
                        return;
                    }
                    if (typeof onComplete === 'function') {
                        onComplete(err, retCode);
                    }
                });
            });

        });
    };
}


module.exports.getNewInstance = function(options, callback) {
    var def = extend({}, defaults);
    options = extend(def, options);
    if (options.password) {
        options.pemFilePath = null;
    } else {
        options.password = null;
    }
    console.log('Initializing class');
    java.newInstance('com.relevancelab.catalyst.security.ssh.SSHExec', options.host, options.port, options.username, options.password, options.pemFilePath, function(err, javaSSHInstance) {

        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        var javaSSH = new JavaSSH(javaSSHInstance, options);
        callback(null, javaSSH);
    });

}