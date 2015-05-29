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
var appConfig = require('../config/app_config');
var chefDefaults = appConfig.chef;
var javaSSHWrapper = require('./../model/javaSSHWrapper.js');
var logger = require('./logger.js')(module);
var getDefaultCookbook = require('./defaultTaskCookbook');
var currentDirectory = __dirname;
var fs = require('fs');

var app_config;

var Chef = function(settings) {


    var chefClient = null;
    var that = this;

    var bootstrapattemptcount = 0;

    function initializeChefClient(callback) {
        logger.debug('User Pem file:' , settings.chefUserPemFile);
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
                    return ;
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
                console.log(err);
                callback(err, null);
                return;
            }
            chefClient.get('/environments', function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return console.log(err);
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
            logger.debug('REceipe query:' , cookbookName);
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
                logger.debug('Process out :' , data);
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
                        console.log('Hit an error :' + data);
                        callbackOnStdErr(data);
                    }
                } else {
                    console.log('Hit an error :' + data);
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
                argList.push('Zaq!2wsx'); // temp hack
            } else {
                argList.push(params.instancePassword);
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
        logger.debug('Environment : ' , params.environment);
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
        procNodeDelete.on('close', function(code) {
            logger.debug('procNodeDelete closed');
            //console.log('Command : knife ' + argList.join());
            logger.debug('knife command ==> ', 'knife ' + argList.join(' '));
            var proc = new Process('knife', argList, options);
            proc.start();

        });



    };

    this.cleanChefonClient = function(options, callback, callbackOnStdOut, callbackOnStdErr) {

        if (options.instanceOS != 'windows') {
            var sshParamObj = {
                host: options.host,
                port: options.port,
                username: options.username
            };
            var sudoCmd;
            if (options.privateKey) {
                sshParamObj.pemFilePath = options.privateKey;
                if (options.passphrase) {
                    sshParamObj.passphrase = options.passphrase;
                }
            } else {
                sshParamObj.password = options.password;
            }

            javaSSHWrapper.getNewInstance(sshParamObj, function(err, javaSSh) {
                if (err) {
                    callback(err, null);
                    return;
                }
                // console.log('Run List:' + runlist.join());
                javaSSh.executeListOfCmds(options.cmds, callback, callbackOnStdOut, callbackOnStdErr);
            });

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
            var sshParamObj = {
                host: options.host,
                port: options.port,
                username: options.username
            };
            var sudoCmd;
            if (options.privateKey) {
                sshParamObj.pemFilePath = options.privateKey;
                if (options.passphrase) {
                    sshParamObj.passphrase = options.passphrase;
                }
            } else {
                sshParamObj.password = options.password;
            }
            logger.debug('json jsonAttributes ==> ', options.jsonAttributes);

            javaSSHWrapper.getNewInstance(sshParamObj, function(err, javaSSh) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug('Run List:' + runlist.join());
                javaSSh.execChefClient(runlist.join(), overrideRunlist, options.jsonAttributes, callback, callbackOnStdOut, callbackOnStdErr);
            });

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
            var proc = new Process('knife', ['winrm', options.host, ' "chef-client -o ' + runlist.join() + '"', '-m', '-P' + options.password, '-x' + options.username], processOptions);
            proc.start();
            //[7:04:22 PM] Ashna Abbas:  knife winrm 54.69.130.187 'chef-client -r recipe[apache2-windows]' -P 'Zaq!2wsx' -xadministrator -m
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
        logger.debug('knife ssh name:' + nodeName, 'chef-client -r "' + params.runlist.join() + '" -i' + params.pemFilePath + '-x' + params.instanceUserName + '-a' + params.instancePublicIp)
        var proc = new Process('knife', ['ssh', 'name:' + nodeName, 'chef-client -r "' + params.runlist.join() + '"', '-i' + params.pemFilePath, '-x' + params.instanceUserName, '-a' + params.instancePublicIp], options);
        proc.start();
    };


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
                console.log(code);
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
                console.log(code);
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
                    console.log(dependecyDataToAppend);
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
                } else if(chefRes.statusCode === 409){
                    callback(null, chefRes.statusCode);
                    return;
                }else{
                    callback(true, null);
                    return;
                }

            });

        });

    }

    this.deleteDataBag = function(dataBagName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                logger.debug("error1>>>>> "+err);
                callback(err, null);
                return;
            }
            logger.debug(">>>>>>>>>>>>>>>>>>>>> ",dataBagName);
            chefClient.delete('/data/'+dataBagName, function(err, chefRes, chefResBody) {
                if (err) {
                    logger.debug("error>>>>> "+err);
                    callback(err, null);
                    return;
                }
                logger.debug("chef status create==> ", chefRes.statusCode);
                if (chefRes.statusCode === 200) {
                    callback(null, chefRes.statusCode);
                    return;
                }else if (chefRes.statusCode === 404) {
                    callback(null, chefRes.statusCode);
                    return;
                }else {
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

    this.createDataBagItem = function(dataBagName,dataBagItem,isEncrypt,callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            logger.debug("isEncrypt>>>>>> ",isEncrypt);
            if(isEncrypt){
                var options = {
                    cwd: settings.userChefRepoLocation + '/.chef',
                    onError: function(err) {
                        callback(err, null);
                    },
                    onClose: function(code) {
                        callback(null, code);
                    }
                };
                var targetDir = currentDirectory+"/../config/catdata/catalyst/temp/dbItem.json";
                logger.debug("Current dir: ",targetDir);
                fs.writeFile(targetDir,JSON.stringify(dataBagItem),function(err){
                    if(err){
                        logger.debug("File creation failed : ",err);
                        callback(err,null);
                        return;
                    }
                    logger.debug("File Created....");
                var createDBItem = 'knife data bag from file '+dataBagName+" "+targetDir+' --secret '+'/home/gobinda/openssl/secret_key';
                var procDBItem = exec(createDBItem, options, function(err, stdOut, stdErr) {
                    if (err) {
                        logger.debug('Failed in procDBItem', err);
                        return;
                    }
                    fs.unlink(targetDir);
                    logger.debug("File deleted successfully..");
                    callback(null,dataBagItem);
                    return;
                });
                /*var argList =[];
                var proc = new Process(createDBItem, argList, options);
                proc.start();*/
            });

            }else{
                chefClient.post('/data/'+dataBagName, dataBagItem, function(err, chefRes, chefResBody) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    logger.debug("chef status create==> ", chefRes.statusCode);
                    if (chefRes.statusCode === 201) {
                        callback(null, chefResBody);
                        return;
                    }else if(chefRes.statusCode === 409){
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

    this.updateDataBagItem = function(dataBagName,itemId,dataBagItem, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.put('/data/'+dataBagName+'/'+itemId, dataBagItem, function(err, chefRes, chefResBody) {
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

        });

    }

    this.deleteDataBagItem = function(dataBagName,itemName, callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.delete('/data/' + dataBagName+'/'+itemName, function(err, chefRes, chefResBody) {
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

    this.getDataBagItemById = function(dataBagName,itemName ,callback) {
        initializeChefClient(function(err, chefClient) {
            if (err) {
                callback(err, null);
                return;
            }
            chefClient.get('/data/' + dataBagName+'/'+itemName, function(err, chefRes, chefResBody) {
                if (err) {
                    callback(err, null);
                    return;
                }
                logger.debug("chef status ", chefRes.statusCode);
               
                if (chefRes.statusCode === 200) {
                    callback(null, chefResBody);
                    return;
                }if (chefRes.statusCode === 404) {
                    callback(null, "{}");
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