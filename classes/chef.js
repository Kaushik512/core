var Process = require("./utils/process");
var fileIo = require('./utils/fileio');
var chefApi = require('chef');
var SSH = require('./utils/sshexec');
var chefDefaults = require('../config/chef_config');

var Chef = function(settings) {


    var chefClient = null;
    var that = this;

    function initializeChefClient(callback) {
        if (!chefClient) {
            fileIo.readFile(settings.chefUserPemFile, function(err, key) {
                if (err) {
                    callback(err, null);
                    return;
                }
                chefClient = chefApi.createClient(settings.chefUserName, key, settings.hostedChefUrl);
                callback(null, chefClient);
            });
        } else {
            callback(null, chefClient);
        }
    }

    this.getNodesList = function(callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            chefClient.get('/nodes', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return console.log(err);
                }
                if (chefRes.statusCode !== 200 || chefRes.statusCode !== 201 ) {
                    callback(true, null);
                    return;
                }
                var nodeNames = Object.keys(chefResBody);
                callback(null, nodeNames);
            });
        });
    }

    this.getNode = function(nodeName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/nodes/' + nodeName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback({
                        err: "not found",
                        chefStatusCode: chefRes.statusCode
                    }, null);
                }
            });
        });
    };

    this.getNodesDetailsForEachEnvironment = function(callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/nodes', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return console.log(err);
                }

                var environmentList = {};
                var nodeNames = Object.keys(chefResBody);
                var count = 0;
                if (nodeNames.length) {
                    for (var i = 0; i < nodeNames.length; i++) {
                        chefClient.get('/nodes/' + nodeNames[i], function(err, chefRes, chefResBody) {
                            count++;
                            if (err) {
                                console.log("Error getting details of node");
                                return console.log(err);
                            }
                            if (!environmentList[chefResBody.chef_environment]) {
                                environmentList[chefResBody.chef_environment] = {};
                                environmentList[chefResBody.chef_environment].nodes = [];
                            }
                            environmentList[chefResBody.chef_environment].nodes.push(chefResBody);

                            if (count === nodeNames.length) {
                                callback(null, environmentList);
                            }

                        });
                    }
                } else {
                    callback(null, environmentList);
                }

            });
        });

    };

    this.getCookbooksList = function(callback) {

        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/cookbooks', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }

            });

        });
    };

    this.getCookbook = function(cookbookName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/cookbooks/'+cookbookName+'/_latest', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status ", chefRes.statusCode);
                console.log(chefResBody);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }

            });

        });
    }

    this.getRolesList = function(callback) {

        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/roles', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }

            });

        });

    };

    this.createEnvironment = function(envName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.post('/environments', {
                "name": envName,
                "json_class": "Chef::Environment",
                "description": "",
                "chef_type": "environment"
            }, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status create==> ", chefRes.statusCode);
                if (chefRes.statusCode === 201) {
                    callback(null, envName);
                } else {
                    callback(true, null);
                }

            });

        });

    }

    this.getEnvironment = function(envName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/environments/' + envName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status ==> ", chefRes.statusCode);
                if (chefRes.statusCode === 404) {
                    callback(null, null);
                } else if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }


            });

        });

    };

    this.updateNode = function(nodeName, updateData, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log('nodeName == >', nodeName);
            chefClient.put('/nodes/' + nodeName, updateData, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("chef status ==> ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }
            });
        });
    };



    this.bootstrapInstance = function(params, callback, callbackOnStdOut, callbackOnStdErr) {
        console.log('Chef Repo Location : ', settings.userChefRepoLocation)
        var options = {
            cwd: settings.userChefRepoLocation + '/.chef',
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                callback(null, code);
            }
        };
        if (typeof callbackOnStdOut === 'function') {
            options.onStdOut = function(data) {
                callbackOnStdOut(data);
            }
        }

        if (typeof callbackOnStdErr === 'function') {
            options.onStdErr = function(data) {
                callbackOnStdErr(data);
            }
        }
        if ((!(params.runlist) || !params.runlist.length)) {
            params.runlist = [];

        }
        var argList = ['bootstrap'];

        if (params.instanceOS == 'windows') {

            argList.push('windows');
            argList.push('winrm');
        }
        argList.push(params.instanceIp);

        var runlist = chefDefaults.defaultChefCookbooks.concat(params.runlist);
        var credentialArg;
        if (params.pemFilePath) {
            credentialArg = '-i' + params.pemFilePath;

        } else {
            credentialArg = '-P' + params.instancePassword;
        }
        argList.push(credentialArg);

        if (params.instanceOS == 'windows') {
            argList.push('-p5985');

        } else {
            argList.push('--sudo');
        }
        argList = argList.concat(['-r' + runlist.join(), '-x' + params.instanceUsername, '-N' + params.nodeName, '-E' + params.environment]);

        console.log('bootstrap arglist ==>', argList);


        var proc = new Process('knife', argList, options);
        proc.start();
    };

    this.runChefClient = function(options, callback, callbackOnStdOut, callbackOnStdErr) {
        var runlist = options.runlist;
        var chefRunParamOveright = '-o';
        if (options.updateRunlist) {
            chefRunParamOveright = '-r';
        }
        if (!runlist) {
            runlist = [];
        }
        if (options.instanceOS != 'windows') {
            var sshParamObj = {
                host: options.host,
                port: options.port,
                username: options.username
            };
            var sudoCmd;
            if (options.privateKey) {
                sshParamObj.privateKey = options.privateKey;
                if (options.passphrase) {
                    sshParamObj.passphrase = options.passphrase;
                }
                sudoCmd = "sudo";
            } else {
                sshParamObj.password = options.password;
                sudoCmd = 'echo "'+options.password+'" | sudo -S';
            }
            var sshConnection = new SSH(sshParamObj);
            
            sshConnection.exec(sudoCmd+' chef-client ' + chefRunParamOveright + ' ' + runlist.join(), callback, callbackOnStdOut, callbackOnStdErr);

        } else {

            var processOptions = {
                cwd: settings.userChefRepoLocation,
                onError: function(err) {
                    callback(err, null);
                },
                onClose: function(code) {
                    callback(null, code);
                }
            };
            if (typeof callbackOnStdOut === 'function') {
                processOptions.onStdOut = function(data) {
                    callbackOnStdOut(data);
                }
            }

            if (typeof callbackOnStdErr === 'function') {
                processOptions.onStdErr = function(data) {
                    callbackOnStdErr(data);
                }
            }

            //      knife ssh 'name:<node_name>' 'chef-client -r "recipe[a]"' -x root -P pass
            console.log('host name ==>', options.host);
            var proc = new Process('knife', ['winrm', options.host, 'chef-client ' + chefRunParamOveright + ' "' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            proc.start();

        }

    };


    this.updateAndRunNodeRunlist = function(nodeName, params, callback, callbackOnStdOut, callbackOnStdErr) {
        var options = {
            cwd: settings.chefReposLocation + settings.userChefRepoName,
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                callback(null, code);
            }
        };
        if (typeof callbackOnStdOut === 'function') {
            options.onStdOut = function(data) {
                callbackOnStdOut(data);
            }
        }

        if (typeof callbackOnStdErr === 'function') {
            options.onStdErr = function(data) {
                callbackOnStdErr(data);
            }
        }
        if ((!(params.runlist) || !params.runlist.length)) {
            params.runlist = [' '];

        }
        //      knife ssh 'name:<node_name>' 'chef-client -r "recipe[a]"' -x root -P pass

        var proc = new Process('knife', ['ssh', 'name:' + nodeName, 'chef-client -r "' + params.runlist.join() + '"', '-i' + params.pemFilePath, '-x' + params.instanceUserName, '-a' + params.instancePublicIp], options);
        proc.start();
    };




}

module.exports = Chef;