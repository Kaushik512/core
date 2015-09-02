var SSHExec = require('./utils/sshexec');
var https = require('https');
var fs = require('fs');

var Buffer = require('buffer');
var logger = require('_pr/logger')(module);
var util = require('util');
var YAML = require('yamljs');
var SCP = require('_pr/lib/utils/scp');
var Process = require("_pr/lib/utils/process");
var Cryptography = require('_pr/lib/utils/cryptography');
var config = require('_pr/config');


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
        var cryptoConfig = config.cryptoSettings;
        var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
        sshOptions.password = cryptography.decryptText(settings.password, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding);
        settings.password = sshOptions.password;
        console.log(settings.password);
    }

    function runSSHCmd(sshOptions, cmds, onComplete, onStdOut, onStdErr) {
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

    function runSSHCmdOnMaster(cmds, onComplete, onStdOut, onStdErr) {
        runSSHCmd(sshOptions, cmds, onComplete, onStdOut, onStdErr);
    }

    function runSSHCmdOnAgent(sshOptions, cmds, onComplete, onStdOut, onStdErr) {
        runSSHCmd(sshOptions, cmds, onComplete, onStdOut, onStdErr);
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
        runSSHCmdOnMaster('puppet config print', function(err, retCode) {
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

    function changePuppetServerPemFilePerm(callback) {

        if (sshOptions.privateKey) {
            fs.chmod(sshOptions.privateKey, 0600, function(err) {
                if (err) {
                    console.log(err);
                    callback(err);
                    return;
                }
                callback(null);
            });

        } else {
            process.nextTick(function() {
                callback(null);
            });
        }

    };


    this.bootstrapInstance = function(node, callback, callbackStdOut, callbackStdErr) {
        if (typeof callbackStdOut !== 'function') {
            callbackStdOut = function() {

            }
        }
        if (typeof callbackStdErr !== 'function') {
            callbackStdErr = function() {

            }
        }
        // getting hostname of puppet master
        changePuppetServerPemFilePerm(function(err) {
            if (err) {
                callback({
                    message: "Unable to change permission of pem file of puppet-master.",
                    err: err
                }, null);
                return;
            }

            var hostNamePuppetMaster = '';
            runSSHCmdOnMaster('hostname -f', function(err, retCode) {
                if (err) {
                    callback({
                        message: "Unable to get hostname of puppet-master. Unable to ssh into puppet master",
                        err: err
                    }, null);
                    return;
                }
                if (retCode !== 0) {
                    message = "Unable to get hostname of puppet-master. Cmd failed with ret code : " + retCode
                    callback({
                        message: message,
                        retCode: retCode
                    }, null);
                    return;
                }
                hostNamePuppetMaster = hostNamePuppetMaster.replace(/[\t\n\r\b\0\v\f\'\"\\]/g, '');
                hostNamePuppetMaster = hostNamePuppetMaster.trim();


                // getting hostname of client
                var hostnamePuppetAgent = '';
                var sshOptions = {
                    username: node.username,
                    host: node.host,
                    port: 22,
                }
                if (node.pemFileLocation) {
                    sshOptions.privateKey = node.pemFileLocation;
                } else {
                    sshOptions.password = node.password;
                }

                runSSHCmdOnAgent(sshOptions, 'hostname -f', function(err, retCode) {
                    if (err) {
                        callback({
                            message: "Unable to get hostname of node. Unable to ssh into puppet node",
                            err: err
                        }, null);

                        return;
                    }
                    if (retCode !== 0) {
                        message = "Unable to get hostname of node. Cmd failed with ret code : " + retCode
                        callback({
                            message: message,
                            retCode: retCode
                        }, null);
                        return;
                    }
                    hostnamePuppetAgent = hostnamePuppetAgent.replace(/[\t\n\r\b\0\v\f\'\"\\]/g, '');
                    hostnamePuppetAgent = hostnamePuppetAgent.trim();
                    // copying cookbook on client machine
                    var jsonAttributes = {
                        "puppet_configure": {
                            "cache_dir": "/var/chef/cache",
                            "client": {
                                "user": node.username,
                                //"pswd": "vagrant",
                                "ipaddress": node.host,
                                "fqdn": hostnamePuppetAgent,
                                "environment": node.environment
                                //"ssh_pass_method": false,
                                //"pem_file": node.pemFileLocation
                            },
                            "puppet_master": {
                                "user": settings.username,
                                //"pswd": "vagrant",
                                "ipaddress": settings.host,
                                "fqdn": hostNamePuppetMaster,
                                //"ssh_pass_method": false,
                                //"pem_file": settings.pemFileLocation
                            }
                        }
                    }
                    if (node.pemFileLocation) {
                        jsonAttributes["puppet_configure"]['client']["pem_file"] = node.pemFileLocation;
                        jsonAttributes["puppet_configure"]['client']["ssh_pass_method"] = false;
                    } else {
                        jsonAttributes["puppet_configure"]['client']["pswd"] = node.password;
                        jsonAttributes["puppet_configure"]['client']["ssh_pass_method"] = true;
                    }

                    if (settings.pemFileLocation) {
                        jsonAttributes["puppet_configure"]['puppet_master']["pem_file"] = settings.pemFileLocation;
                        jsonAttributes["puppet_configure"]['puppet_master']["ssh_pass_method"] = false;
                    } else {
                        jsonAttributes["puppet_configure"]['puppet_master']["pswd"] = settings.password;
                        jsonAttributes["puppet_configure"]['puppet_master']["ssh_pass_method"] = true;
                    }


                    var scp = new SCP(sshOptions);
                    scp.upload(__dirname + '/../cookbooks.tar', '/tmp', function(err) {
                        if (err) {
                            console.log(err);
                            callback({
                                message: "Unable to upload cookbooks onto the node",
                                err: err
                            }, null);
                            return;
                        }
                        var jsonAttributeFile = '/tmp/puppet_jsonAttributes_' + new Date().getTime() + '.json';
                        fs.writeFile(jsonAttributeFile, JSON.stringify(jsonAttributes), function(err) {
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            scp.upload(jsonAttributeFile, '/tmp/chef-solo.json', function(err) {
                                if (err) {
                                    callback({
                                        message: "Unable to upload attribute json file on to the node",
                                        err: err
                                    }, null);
                                    return;
                                }
                                // extracting cookbook on clinet machine
                                runSSHCmdOnAgent(sshOptions, 'tar -xf /tmp/cookbooks.tar -C /tmp/', function(err, retCode) {
                                    if (err) {
                                        callback({
                                            message: "Unable to upload extract cookbooks.tar on the node",
                                            err: err
                                        }, null);
                                        return;
                                    }
                                    if (retCode !== 0) {
                                        message = "Unable to upload extract cookbooks.tar on the node. cmd failed with ret code : " + retCode
                                        callback({
                                            message: message,
                                            retCode: retCode
                                        }, null);
                                        return;
                                    }
                                    // creating chef-solo.rb file
                                    var proc = new Process('echo "cookbook_path            [\'' + __dirname + '/../../seed/catalyst/cookbooks/' + '\']" > /etc/chef/solo.rb', [], {
                                        //cwd: settings.userChefRepoLocation + '/.chef',
                                        onError: function(err) {
                                            callback({
                                                message: "Unable to create solo.rb file on catalyst machine",
                                                err: err
                                            }, null);
                                        },
                                        onClose: function(code) {
                                            if (code !== 0) {
                                                message: "Unable to create solo.rb file on catalyst machine. Cmd failed with ret code : " + code,
                                                callback({
                                                    message: message,
                                                    retCode: code
                                                }, null);
                                                return;
                                            }
                                            // running chef-solo


                                            var argList = [];
                                            argList.push('-o');
                                            argList.push('recipe[puppet_configure::client_bootstrap]');

                                            argList.push('-j');
                                            argList.push(jsonAttributeFile);

                                            var proc = new Process('chef-solo ' + argList.join(' '), [], {
                                                //cwd: settings.userChefRepoLocation + '/.chef',
                                                onError: function(err) {
                                                    callback(err, null);
                                                },
                                                onClose: function(code) {
                                                    callback(null, code, {
                                                        puppetNodeName: hostnamePuppetAgent
                                                    });
                                                },
                                                onStdErr: function(stdErr) {
                                                    callbackStdErr(stdErr);
                                                    console.error(stdErr.toString());
                                                },
                                                onStdOut: function(stdOut) {
                                                    callbackStdOut(stdOut);
                                                    console.log(stdOut.toString());
                                                }
                                            });
                                            proc.start();

                                        }
                                    });
                                    proc.start();
                                });
                            });
                        });

                    });

                }, function(stdOut) {
                    hostnamePuppetAgent = hostnamePuppetAgent + stdOut.toString('utf8');
                })

            }, function(stdOut) {
                hostNamePuppetMaster = hostNamePuppetMaster + stdOut.toString('utf8');
            }, function(stdErr) {

            });
        });

    };

    this.getEnvironments = function(callback) {

        var stdOutStr = '';
        var stdErrStr = '';
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log('envPath  == >' + puppetConfig.environmentpath);
            runSSHCmdOnMaster('ls ' + puppetConfig.environmentpath, function(err, retCode) {
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
                        stdOutStr[i] = stdOutStr[i].trim();
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
        if (!envName) {
            process.nextTick(function() {
                callback({
                    message: "Invalid environment name",
                    retCode: -1
                })
            });
            return;
        }
        getPuppetConfig(function(err, puppetConfig) {
            if (err) {
                callback(err, null);
                return;
            }
            var stdOutStr = '';
            var stdErrStr = '';
            runSSHCmdOnMaster(['mkdir -p ' + puppetConfig.environmentpath + '/' + envName + '/manifest', 'mkdir -p ' + puppetConfig.environmentpath + '/' + envName + '/modules'], function(err, retCode) {
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
            runSSHCmdOnMaster('ls ' + puppetConfig.yamldir + '/node', function(err, retCode) {
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
            runSSHCmdOnMaster('cat ' + puppetConfig.yamldir + '/node/' + nodeName + '.yaml', function(err, retCode) {
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

    this.deleteNode = function(nodeName, callback) {
        runSSHCmdOnMaster('puppet cert clean ' + nodeName, function(err, retCode) {
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
            callback(null, true);
        });
    };

    this.getPuppetConfig = function(callback) {
        getPuppetConfig(callback);
    };

};

module.exports = Puppet;