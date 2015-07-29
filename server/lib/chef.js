/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * May 2015
 */

// This file contains Chef Server related all business logic.

var Process = require("./utils/process");
var childProcess = require('child_process');
var exec = childProcess.exec;
var fileIo = require('./utils/fileio');
var chefApi = require('chef');
var appConfig = require('_pr/config');
var chefDefaults = appConfig.chef;
//var javaSSHWrapper = require('./../model/javaSSHWrapper.js');
var logger = require('_pr/logger')(module);
var getDefaultCookbook = require('./defaultTaskCookbook');
var currentDirectory = __dirname;
var fs = require('fs');
//var DataBagModel = require('../model/classes/masters/databag.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var SSHExec = require('./utils/sshexec');

var app_config;

var Chef = function(settings) {


    var chefClient = null;
    var that = this;

    var bootstrapattemptcount = 0;

    function initializeChefClient(callback) {
        logger.debug('User Pem file:', settings.chefUserPemFile);
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
                logger.debug(err);
                callback(err, null);
                return;
            }
            chefClient.get('/nodes', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status", chefRes.statusCode);
                if (chefRes.statusCode !== 200 && chefRes.statusCode !== 201) {
                    callback(true, null);
                    return;
                }

                var nodeNames = Object.keys(chefResBody);
                callback(null, nodeNames);
            });
        });
    }

    this.getEnvironmentsList = function(callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                logger.debug(err);
                callback(err, null);
                return;
            }
            chefClient.get('/environments', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return logger.debug(err);
                }
                logger.debug("chef status", chefRes.statusCode);
                if (chefRes.statusCode !== 200 && chefRes.statusCode !== 201) {
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

    this.deleteNode = function(nodeName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.delete('/nodes/' + nodeName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else if (chefRes.statusCode === 404) {
                    callback({
                        err: "not found",
                        chefStatusCode: chefRes.statusCode
                    }, null);
                } else {
                    callback({
                        err: "error",
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
                    return logger.debug(err);
                }

                var environmentList = {};
                var nodeNames = Object.keys(chefResBody);
                var count = 0;
                if (nodeNames.length) {
                    for (var i = 0; i < nodeNames.length; i++) {
                        chefClient.get('/nodes/' + nodeNames[i], function(err, chefRes, chefResBody) {
                            count++;
                            if (err) {
                                logger.debug("Error getting details of node");
                                return logger.debug(err);
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
                logger.debug("chef status ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }

            });

        });
    };

    //Included a query to get receipes for cookbook - for service masters - Vinod
    this.getReceipesForCookbook = function(cookbookName, callback) {

        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            logger.debug('REceipe query:', cookbookName);
            chefClient.get('/cookbooks/' + cookbookName + '/_latest', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody.recipes);
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
            chefClient.get('/cookbooks/' + cookbookName + '/_latest', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

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
                logger.debug("chef status ", chefRes.statusCode);
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
                logger.debug("chef status create==> ", chefRes.statusCode);
                if (chefRes.statusCode === 201) {
                    callback(null, envName);
                } else if (chefRes.statusCode === 409) {
                    callback(null, chefRes.statusCode);
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
                logger.debug("chef status ==> ", chefRes.statusCode);
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
            logger.debug('nodeName == >', nodeName);
            chefClient.put('/nodes/' + nodeName, updateData, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ==> ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                } else {
                    callback(true, null);
                }
            });
        });
    };
    //var bootstrapDelay = 1200000;
    var bootstrapDelay = 0;

    this.bootstrapInstance = function(params, callback, callbackOnStdOut, callbackOnStdErr) {
        logger.debug('Chef Repo Location : ', settings.userChefRepoLocation)
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
                logger.debug('Process out :', data.toString('ascii'));
                callbackOnStdOut(data);
            }
        }

        if (typeof callbackOnStdErr === 'function') {

            options.onStdErr = function(data) {
                /*if ( bootstrapattemptcount < 4) {
                    //retrying bootstrap .... needed for windows
                    if (data.toString().indexOf('No response received from remote node after') >= 0 || data.toString().indexOf('ConnectTimeoutError:') >= 0) {
                        callbackOnStdOut(data.toString() + '.Retrying. Attempt ' + (bootstrapattemptcount + 1) + '/4 ...');
                        that.bootstrapInstance(params, callback, callbackOnStdOut, callbackOnStdErr);
                        bootstrapattemptcount++;
                    } else {
                        logger.debug('Hit an error :' + data);
                        callbackOnStdErr(data);
                    }
                } else {
                    logger.debug('Hit an error :' + data);
                    callbackOnStdErr(data);
                }
                return;*/
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
        if (params.pemFilePath && (params.instanceOS != 'windows')) {
            argList.push('-i');
            argList.push(params.pemFilePath);
            //    credentialArg = '-i' + params.pemFilePath;

        } else {
            if (params.instanceOS != 'windows') {
                argList.push('--use-sudo-password');
            }
            argList.push('-P');
            if (params.instanceOS == 'windows' && !params.instancePassword) {
                argList.push('\"Zaq!2wsx\"'); // temp hack
            } else {
                argList.push('\"' + params.instancePassword + '\"');
            }
        }

        if (params.instanceOS == 'windows') {
            argList.push('-p');
            argList.push('5985');
        } else {
            argList.push('--sudo');
        }

        if (runlist.length) {
            argList.push('-r');
            argList.push(runlist.join());
        }
        logger.debug('Environment : ', params.environment);
        argList = argList.concat(['-x', params.instanceUsername, '-N', params.nodeName, '-E', params.environment]);

        if (chefDefaults.ohaiHints && chefDefaults.ohaiHints.length) {
            for (var i = 0; i < chefDefaults.ohaiHints.length; i++) {
                if (params.instanceOS && params.instanceOS != 'windows') {
                    argList.push('--hint');
                    argList.push(chefDefaults.ohaiHints[i]);
                }

            }
        }
        var cmdCreateEnv = 'knife environment create ' + params.environment + ' -d catalystcreated';

        var procEnv = exec(cmdCreateEnv, options, function(err, stdOut, stdErr) {
            if (err) {
                logger.debug('Failed in procEnv', err);
                return;
            }
        });
        logger.debug('knife client delete ' + params.nodeName + ' -y && knife node delete ' + params.nodeName + ' -y');
        var cmdRemoveChefNode = 'knife client delete ' + params.nodeName + ' -y && knife node delete ' + params.nodeName + ' -y';
        var procNodeDelete = exec(cmdRemoveChefNode, options, function(err, stdOut, stdErr) {
            if (err) {
                logger.debug('Failed in procNodeDelete chef.js', err);
                return;
            }
        });


        procEnv.on('close', function(code) {
            logger.debug('procEnv closed: ');
        });

        if (params.jsonAttributes) {
            argList.push('-j');
            var jsonAttributesString = JSON.stringify(params.jsonAttributes);
            jsonAttributesString = jsonAttributesString.split('"').join('\\\"');
            argList.push(jsonAttributesString);
        }
        procNodeDelete.on('close', function(code) {
            logger.debug('procNodeDelete closed');
            //logger.debug('Command : knife ' + argList.join());
            logger.debug('knife command ==> ', 'knife ' + argList.join(' '));
            var proc = new Process('knife', argList, options);
            proc.start();

        });



    };

    this.cleanChefonClient = function(options, callback, callbackOnStdOut, callbackOnStdErr) {

        if (options.instanceOS != 'windows') {

            logger.debug('cleaning chef from remote host');
            var cmds = ["rm -rf /etc/chef/", "rm -rf /var/chef/"];
            var cmdString = cmds.join(' && ');


            var sudoCmd = 'sudo ';
            if (options.password) {
                sudoCmd = 'echo \"' + options.password + '\" | sudo -S ';
            }
            cmdString = sudoCmd + cmdString;
            console.log(cmdString);
            var sshExec = new SSHExec(options);
            sshExec.exec(cmdString, callback, callbackOnStdOut, callbackOnStdErr);


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
            logger.debug('host name ==>', options.host);
            //var proc = new Process('knife', ['winrm', options.host, 'chef-client ' + chefRunParamOveright + ' "' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            //  var proc = new Process('knife', ['winrm', options.host, 'chef-client ' + ' "' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            //    proc.start();
            callback(null, "1");

        }

    };

    this.runChefClient = function(options, callback, callbackOnStdOut, callbackOnStdErr) {
        var runlist = options.runlist;
        var overrideRunlist = false;
        if (options.overrideRunlist) {
            overrideRunlist = true;
        }
        if (!runlist) {
            runlist = [];
        }
        //options.jsonAttributes = JSON.stringify({"A":{"B":{"passedin":"Cool Test"}}});

        runlist = chefDefaults.defaultChefClientRunCookbooks.concat(runlist);

        if (options.instanceOS != 'windows') {

            var lockFile = false;
            if (options.parallel) {
                lockFile = true;
            }



            // using ssh2
            var cmd = '';
            cmd = "chef-client";
            if (overrideRunlist) {
                cmd += " -o";
            } else {
                cmd += " -r";
            }
            cmd += " " + runlist.join();

            var timestamp = new Date().getTime();
            if (lockFile) {
                cmd += " --lockfile /var/tmp/catalyst_lockFile_" + timestamp;
            }
            if (options.jsonAttributes) {
                var jsonFileName = "chefRunjsonAttributes_" + timestamp + ".json";
                var jsonAttributesString = options.jsonAttributes; // JSON.stringify(options.jsonAttributes);
                jsonAttributesString = jsonAttributesString.split('"').join('\\\"');
                var cmdWithJsonAttribute = '';
                cmdWithJsonAttribute += 'echo "' + jsonAttributesString + '" > ' + jsonFileName + ' && sudo ' + cmd + ' -j ' + jsonFileName;
                cmd = cmdWithJsonAttribute;
            }
            var sudoCmd = "sudo";
            if (options.password) {
                sudoCmd = 'echo \"' + options.password + '\" | sudo -S';
            }

            logger.debug("chef client cmd ==> " + cmd);
            cmd = sudoCmd + " " + cmd;

            var sshExec = new SSHExec(options);
            sshExec.exec(cmd, callback, callbackOnStdOut, callbackOnStdErr);


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
            logger.debug('host name ==>', options.host);
            //var proc = new Process('knife', ['winrm', options.host, 'chef-client ' + chefRunParamOveright + ' "' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            //var proc = new Process('knife', ['winrm', options.host, ' " chef-client -o' + ' ' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            if (!options.password) {
                options.password = 'Zaq!2wsx'; // temp hack
            }
            var proc = new Process('knife', ['winrm', options.host, ' "chef-client -o ' + runlist.join() + '"', '-m', '-P\"' + options.password + '\"', '-x' + options.username], processOptions);
            proc.start();
            //[7:04:22 PM] Ashna Abbas:  knife winrm 54.69.130.187 'chef-client -r recipe[apache2-windows]' -P 'Zaq!2wsx' -xadministrator -m
        }

    };

    this.runKnifeWinrmCmd = function(cmd, options, callback, callbackOnStdOut, callbackOnStdErr) {
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
        if (!options.password) {
            options.password = 'Zaq!2wsx'; // temp hack
        }
        //var proc = new Process('knife', ['winrm', options.host, ' "powershell ' + cmd + ' "', '-m', '-P', options.password, '-x', options.username], processOptions);
        var proc = new Process('knife', ['winrm', options.host, "\'" + cmd + "\'", '-m', '-P\"', options.password + '\"', '-x', options.username], processOptions);
        proc.start();


    }


    this.updateNodeEnvironment = function(nodeName, newEnvironment, callback) {
        logger.debug('Chef Repo Location : ', settings.userChefRepoLocation)
        var options = {
            cwd: settings.userChefRepoLocation,
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                logger.debug(code);
                if (code === 0) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }

            }
        };
        var proc = new Process('knife', ['node', 'environment_set', nodeName, newEnvironment], options);
        proc.start();


    };

    this.downloadCookbook = function(cookbookName, cookbookDir, callback) {
        var options = {
            cwd: settings.userChefRepoLocation,
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                logger.debug(code);
                if (code === 0) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }

            }
        };
        var argList = ['cookbook', 'download', cookbookName];
        if (cookbookDir) {
            argList.push('-d');
            argList.push(cookbookDir);
        }
        argList.push('--force');
        //argList.push('--latest');
        var proc = new Process('knife', argList, options);
        proc.start();
    };

    this.createCookbook = function(cookbookName, cookbookDir, callback) {
        var createCookbookOption = {
            cwd: settings.userChefRepoLocation,
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                logger.debug(code);
                if (code === 0) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            },
            onStdOut: function(outData) {
                logger.debug(outData);
            }
        };
        var argList = ['cookbook', 'create', cookbookName];
        if (cookbookDir) {
            argList.push('-o');
            argList.push(cookbookDir);
        }
        logger.debug('cookbookDir ==> ' + argList);
        var procCreateCookbook = new Process('knife', argList, createCookbookOption);
        procCreateCookbook.start();
    };

    this.uploadCookbook = function(cookbookName, callback) {
        var uploadCookbookOption = {
            cwd: settings.userChefRepoLocation,
            onError: function(err) {
                callback(err, null);
            },
            onClose: function(code) {
                logger.debug(code);
                if (code === 0) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }

            },
            onStdOut: function(outData) {
                logger.debug(outData);
            },
            onStdErr: function(outData) {
                logger.debug("err ==> " + outData);
            }
        };
        var procUploadCookbook = new Process('knife', ['cookbook', 'upload', cookbookName, '--force'], uploadCookbookOption);
        procUploadCookbook.start();
    };

    this.createAndUploadCookbook = function(cookbookName, dependencies, callback) {
        var self = this;
        this.createCookbook(cookbookName, function(err, status) {
            if (err) {
                callback(err, null);
                return;
            }
            if (dependencies && dependencies.length) {
                var dependecyDataToAppend = '';
                for (var i = 0; i < dependencies.length; i++) {
                    dependecyDataToAppend = dependecyDataToAppend + "\ndepends '" + dependencies[i] + "'";
                    logger.debug(dependecyDataToAppend);
                }
                logger.debug(dependencies);
                logger.debug(dependecyDataToAppend);
                fileIo.appendToFile(settings.userChefRepoLocation + '/cookbooks/' + cookbookName + '/metadata.rb', dependecyDataToAppend, function(err) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    self.uploadCookbook(cookbookName, function(err) {
                        if (err) {
                            callback(err, null);
                            return;
                        }
                        callback(null, null);
                    });
                });
            } else {
                self.uploadCookbook(cookbookName, function(err) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, null);
                });
            }
        });
    };

    this.getCookbookAttributes = function(cookbooksList, callback) {

        var self = this;
        var cookbooksListNew = [];
        var count = 0;
        var attributesList = [];

        function getCookbook(cookbookName) {
            self.getCookbook(cookbookName, function(err, cookbookData) {
                count++;
                if (err) {
                    callback(err, null);
                    return;
                }
                var attributeObj = {
                    cookbookName: cookbookName,
                    attributes: cookbookData.metadata.attributes
                };
                attributesList.push(attributeObj);
                if (count < cookbooksList.length) {
                    getCookbook(cookbooksList[count]);
                } else {
                    callback(null, attributesList);
                }
            });
        }

        getCookbook(cookbooksList[count]);
    };

    this.createDataBag = function(dataBagName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.post('/data', {
                "name": dataBagName
            }, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status create==> ", chefRes.statusCode);
                if (chefRes.statusCode === 201) {
                    callback(null, chefResBody);
                    return;
                } else if (chefRes.statusCode === 409) {
                    callback(null, chefRes.statusCode);
                    return;
                } else if (chefRes.statusCode === 400) {
                    callback(null, chefRes.statusCode);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });

    }

    this.deleteDataBag = function(dataBagName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                logger.debug("error1>>>>> " + err);
                callback(err, null);
                return;
            }
            logger.debug(">>>>>>>>>>>>>>>>>>>>> ", dataBagName);
            chefClient.delete('/data/' + dataBagName, function(err, chefRes, chefResBody) {
                if (err) {
                    logger.debug("error>>>>> " + err);
                    callback(err, null);
                    return;
                }
                logger.debug("chef status create==> ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefRes.statusCode);
                    return;
                } else if (chefRes.statusCode === 404) {
                    callback(null, chefRes.statusCode);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });

    }

    this.getDataBags = function(callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/data', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });
    }

    this.createDataBagItem = function(req, dataBagItem, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            var dataBagName = req.params.dataBagName;
            var isEncrypt = req.body.isEncrypt;
            logger.debug("isEncrypt>>>>>> ", typeof isEncrypt);
            var options = {
                cwd: settings.userChefRepoLocation + '/.chef',
                onError: function(err) {
                    callback(err, null);
                },
                onClose: function(code) {
                    callback(null, code);
                }
            };
            if (isEncrypt === "true") {
                d4dModelNew.d4dModelMastersConfigManagement.find({
                    rowid: req.params.serverId
                }, function(err, cmgmt) {
                    if (err) {
                        logger.debug("Error to find cmgmt from mongo.");
                    }
                    logger.debug("Config mgmt: ", JSON.stringify(cmgmt));
                    if (cmgmt[0]) {
                        var readKeyFileLocation = settings.userChefRepoLocation + '/.chef/' + cmgmt[0].encryption_filename;
                        var targetDir = currentDirectory + "/../catdata/catalyst/temp/dbItem.json";
                        fs.readFile(readKeyFileLocation, function(err, existFile) {
                            if (err) {
                                logger.debug("There is no file exist.");
                                callback(null, 403);
                                return;
                            }
                            fs.writeFile(targetDir, JSON.stringify(dataBagItem), function(err) {
                                if (err) {
                                    logger.debug("File creation failed : ", err);
                                    callback(err, null);
                                    return;
                                }
                                logger.debug("File Created....on ", targetDir);
                                var keyFileLocation = settings.userChefRepoLocation + '.chef/' + cmgmt[0].encryption_filename;
                                logger.debug("key file location: ", keyFileLocation);
                                var createDBItem = 'knife data bag from file ' + dataBagName + " " + targetDir + ' --secret-file ' + keyFileLocation;
                                var procDBItem = exec(createDBItem, options, function(err, stdOut, stdErr) {
                                    if (err) {
                                        logger.debug('Failed in procDBItem', err);
                                        callback(err, null);
                                        return;
                                    }
                                    fs.unlink(targetDir);
                                    logger.debug("File deleted successfully..");
                                    callback(null, dataBagItem);
                                    return;
                                });
                            });
                        });

                    } else {
                        logger.debug("No config management found.");
                        callback(null, null);
                        return;
                    }
                });

            } else {
                chefClient.post('/data/' + dataBagName, dataBagItem, function(err, chefRes, chefResBody) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    logger.debug("chef status create==> ", chefRes.statusCode);
                    if (chefRes.statusCode === 201) {
                        callback(null, chefResBody);
                        return;
                    } else if (chefRes.statusCode === 409) {
                        callback(null, chefRes.statusCode);
                        return;
                    } else {
                        callback(true, null);
                        return;
                    }

                });
            }

        });

    }

    this.updateDataBagItem = function(req, dataBagItem, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            var dataBagName = req.params.dataBagName;
            var isEncrypt = req.body.isEncrypt;
            var itemId = req.params.itemId;
            logger.debug("isEncrypt>>>>>> ", typeof isEncrypt);
            var options = {
                cwd: settings.userChefRepoLocation + '/.chef',
                onError: function(err) {
                    callback(err, null);
                },
                onClose: function(code) {
                    callback(null, code);
                }
            };
            if (isEncrypt === "true") {
                d4dModelNew.d4dModelMastersConfigManagement.find({
                    rowid: req.params.serverId
                }, function(err, cmgmt) {
                    if (err) {
                        logger.debug("Error to find cmgmt from mongo.");
                    }
                    logger.debug("Config mgmt: ", JSON.stringify(cmgmt));
                    if (cmgmt[0]) {
                        var readKeyFileLocation = settings.userChefRepoLocation + '/.chef/' + cmgmt[0].encryption_filename;
                        var targetDir = currentDirectory + "/../catdata/catalyst/temp/dbItem.json";
                        fs.readFile(readKeyFileLocation, function(err, existFile) {
                            if (err) {
                                logger.debug("There is no key file exist.");
                                callback(null, 403);
                                return;
                            }
                            fs.writeFile(targetDir, JSON.stringify(dataBagItem), function(err) {
                                if (err) {
                                    logger.debug("File creation failed : ", err);
                                    callback(err, null);
                                    return;
                                }
                                logger.debug("File Created....");
                                var createDBItem = 'knife data bag from file ' + dataBagName + " " + targetDir + ' --secret ' + readKeyFileLocation;
                                var procDBItem = exec(createDBItem, options, function(err, stdOut, stdErr) {
                                    if (err) {
                                        logger.debug('Failed in procDBItem', err);
                                        callback(err, null);
                                        return;
                                    }
                                    fs.unlink(targetDir);
                                    logger.debug("File deleted successfully..");
                                    callback(null, dataBagItem);
                                    return;
                                });
                            });
                        });

                    } else {
                        logger.debug("No config management found.");
                        callback(null, null);
                        return;
                    }
                });
            } else {
                chefClient.put('/data/' + dataBagName + '/' + itemId, dataBagItem, function(err, chefRes, chefResBody) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    logger.debug("chef status create==> ", chefRes.statusCode);
                    if (chefRes.statusCode === 200) {
                        callback(null, chefResBody);
                        return;
                    } else {
                        callback(true, null);
                        return;
                    }

                });
            }

        });

    }

    this.deleteDataBagItem = function(dataBagName, itemName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.delete('/data/' + dataBagName + '/' + itemName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

                if (chefRes.statusCode === 200) {
                    callback(null, chefRes.statusCode);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });
    }

    this.getDataBagItems = function(dataBagName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/data/' + dataBagName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });
    }

    this.getDataBagItemById = function(dataBagName, itemId, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            /*DataBagModel.getDataBagEncryptionInfo(dataBagName, itemId, function(err, aDataBag) {
                if (err) {
                    logger.debug("Error to find data bag from mongo.");
                }
                logger.debug("Data Bag from DB: ",JSON.stringify(aDataBag));
                logger.debug("isEncrypted: ",aDataBag.isEncrypted);
                if (aDataBag.isEncrypted) {
                    logger.debug("if called...")
                    var options = {
                        cwd: settings.userChefRepoLocation + '/.chef',
                        onError: function(err) {
                            callback(err, null);
                        },
                        onClose: function(code) {
                            callback(null, code);
                        }
                    };
                    var showDBItem = 'knife data bag show ' + dataBagName + " " + itemId + ' --secret ' + aDataBag.encryptionKey;
                    var procDBItem = exec(showDBItem, options, function(err, stdOut, stdErr) {
                        if (err) {
                            logger.debug('Failed in procDBItem', err);
                            return;
                        }
                        logger.debug("Decrypted Item: ",stdOut);
                        callback(null, stdOut);
                        return;
                    });

                } else {*/
            chefClient.get('/data/' + dataBagName + '/' + itemId, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                    return;
                }
                if (chefRes.statusCode === 404) {
                    callback(null, "{}");
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });
            /*}
            });*/

        });
    }

    this.deleteEnvironment = function(envName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.delete('/environments/' + envName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);

                if (chefRes.statusCode === 200) {
                    callback(null, chefRes.statusCode);
                    return;
                } else {
                    callback(true, null);
                    return;
                }

            });

        });
    }

}

module.exports = Chef;