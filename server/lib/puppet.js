var SSHExec = require('./utils/sshexec');
var https = require('https');
var fs = require('fs');
var PSON = require('pson');
var Buffer = require('buffer');
var logger = require('_pr/logger')(module);
var util = require('util');
var YAML = require('yamljs');
var Puppet = function(settings) {

    var puppetConfig = null;

    var sshOptions = {
        username: settings.username,
        host: settings.host,
        port: 22,
    }
    if (settings.pemFileLocation) {
        sshOptions.privateKey = settings.pemFileLocation;
    } else {
        sshOptions.password = settings.password;
    }

    function runSSHCmd(cmds, onComplete, onStdOut, onStdErr) {
        var sshExec = new SSHExec(sshOptions);
        var cmdString = '';
        if (util.isArray(cmds)) {
            for (var i = 0; i < cmds.length - 1; i++) {
                cmdString = cmdString + 'sudo ' + cmds[i] + ' && ';
            }
            cmdString = cmdString + 'sudo ' + cmds[cmds.length - 1];
        } else {
            cmdString = 'sudo ' + cmds;
        }
        sshExec.exec(cmdString, onComplete, onStdOut, onStdErr);
    }

    function getPuppetConfig(callback) {
        if (puppetConfig) {
            process.nextTick(function() {
                callback(null, puppetConfig);
            });
            return;
        }
        var stdOutStr = '';
        var stdErrStr = '';
        puppetConfig = {};
        var line = '';
        runSSHCmd('puppet config print', function(err, retCode) {
            if (err) {
                callback(err, null);
                return;
            }
            if (retCode !== 0) {
                message = "cmd run failed with ret code : " + retCode
                callback({
                    message: message,
                    retCode: retCode
                }, null);
                return;
            }
            callback(null, puppetConfig);
        }, function(stdOut) {
            stdOutStr = stdOut.toString('utf8');
            //reading string line by line
            for (var i = 0; i < stdOutStr.length; i++) {
                if (stdOutStr[i] === '\n' || stdOutStr[i] === '\r') {
                    if (line) {
                        var lineParts = line.split('=');
                        if (lineParts.length === 2) {
                            puppetConfig[lineParts[0].trim()] = lineParts[1].trim();
                        }
                        line = '';
                    }

                } else {
                    line = line + stdOutStr[i];
                }
            }

        }, function(stdErr) {
            stdErrStr = stdErrStr + stdErr.toString('utf8');
        });
    }


    this.bootstrap = function(options, callback) {

    };

    this.getEnvironments = function(callback) {

        var stdOutStr = '';
        var stdErrStr = '';
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }
            runSSHCmd('ls ' + puppetConfig.environmentpath, function(err, retCode) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (retCode !== 0) {
                    message = "cmd run failed with ret code : " + retCode
                    callback({
                        message: message,
                        retCode: retCode
                    }, null);
                } else {
                    logger.debug(stdOutStr)
                    stdOutStr = stdOutStr.replace(/[\t\n\r\b\0\v\f\'\"\\]/g, '  ');
                    stdOutStr = stdOutStr.split('  ');
                    var environments = [];
                    for (var i = 0; i < stdOutStr.length; i++) {
                        if (stdOutStr[i]) {
                            environments.push(stdOutStr[i]);
                        }
                    }

                    callback(null, environments);
                }
            }, function(stdOut) {
                stdOutStr = stdOutStr + stdOut.toString('utf8');

            }, function(stdErr) {
                stdErrStr = stdErrStr + stdOut.toString('utf8');
            });

        });


    };

    this.createEnvironment = function(envName, callback) {
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }

            var stdOutStr = '';
            var stdErrStr = '';
            runSSHCmd(['mkdir -p ' + puppetConfig.environmentpath + '/' + envName + '/manifest', 'mkdir -p ' + puppetConfig.environmentpath + '/' + envName + '/modules'], function(err, retCode) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (retCode !== 0) {
                    message = "cmd run failed with ret code : " + retCode
                    callback({
                        message: message,
                        retCode: retCode
                    }, null);
                } else {
                    callback(null, {
                        environment: envName
                    });
                }
            });
        });

    };

    this.getNodesList = function(callback) {
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }
            var stdOutStr = '';
            var stdErrStr = '';
            runSSHCmd('ls ' + puppetConfig.yamldir + '/node', function(err, retCode) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (retCode !== 0) {
                    message = "cmd run failed with ret code : " + retCode
                    callback({
                        message: message,
                        retCode: retCode
                    }, null);
                } else {
                    logger.debug(stdOutStr)
                    stdOutStr = stdOutStr.replace(/[\t\n\r\b\0\v\f\'\"\\]/g, '  ');
                    stdOutStr = stdOutStr.split('  ');
                    var nodes = [];
                    for (var i = 0; i < stdOutStr.length; i++) {
                        if (stdOutStr[i]) {
                            var nodeName = stdOutStr[i].replace('.yaml', '');
                            nodes.push(nodeName);
                        }
                    }
                    callback(null, nodes);
                }
            }, function(stdOut) {
                stdOutStr = stdOutStr + stdOut.toString('utf8');

            }, function(stdErr) {
                stdErrStr = stdErrStr + stdOut.toString('utf8');
            });
        });
    };

    this.getNode = function(nodeName, callback) {
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }
            var stdOutStr = '';
            var stdErrStr = '';
            runSSHCmd('cat ' + puppetConfig.yamldir + '/node/' + nodeName + '.yaml', function(err, retCode) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (retCode !== 0) {
                    message = "cmd run failed with ret code : " + retCode
                    callback({
                        message: message,
                        retCode: retCode
                    }, null);
                    return;
                }
                stdOutStr = stdOutStr.replace(/!/g, '#!');
                var node = YAML.parse(stdOutStr);
                callback(null, node);

            }, function(stdOut) {
                stdOutStr = stdOutStr + stdOut.toString('utf8');

            }, function(stdErr) {
                stdErrStr = stdErrStr + stdOut.toString('utf8');
            });
        });
    };

    this.getPuppetConfig = function(callback) {
        getPuppetConfig(callback);
    }

};

module.exports = Puppet;