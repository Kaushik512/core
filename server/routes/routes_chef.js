var Chef = require('../lib/chef');
var EC2 = require('../lib/ec2');
var instancesDao = require('../model/dao/instancesdao');
var environmentsDao = require('../model/d4dmasters/environments.js');
var logsDao = require('../model/dao/logsdao.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var fileIo = require('../lib/utils/fileio');
var appConfig = require('../config/app_config');
var uuid = require('node-uuid');
var taskStatusModule = require('../model/taskstatus');
var credentialCryptography = require('../lib/credentialcryptography');
var Curl = require('../lib/utils/curl.js');

var errorResponses = require('./error_responses');

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/chef/*', verificationFunc);

    app.get('/chef/servers/:serverId/nodes', function(req, res) {
        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                console.log(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!chefDetails) {
                res.send(404, errorResponses.chef.corruptChefData);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });
            chef.getNodesList(function(err, nodeList) {
                if (err) {
                    res.send(500, errorResponses.chef.connectionError);
                    return;
                } else {
                    res.send(nodeList);
                }
            });

        });
    });


    app.get('/chef/justtesting/:mastername/:fieldname/:comparedfieldname/:comparedfieldvalue', function(req, res) {
        console.log('test', req.params.mastername, ' ' + req.params.fieldname, ' ' + req.params.comparedfieldname);
        configmgmtDao.getListFilteredNew(req.params.mastername, req.params.fieldname, req.params.comparedfieldname, req.params.comparedfieldvalue, function(err, outd) {
            if (!err)
                res.send(outd);
            else
                res.send(err);
        });
    });
    app.get('/chef/servers/:serverId/environments', function(req, res) {
        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                console.log(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!chefDetails) {
                res.send(404, errorResponses.chef.corruptChefData);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });
            chef.getEnvironmentsList(function(err, environmentsList) {
                if (err) {
                    res.send(500, errorResponses.chef.connectionError);
                    return;
                } else {
                    res.send(environmentsList);
                }
            });

        });
    });

    app.get('/chef/servers/:serverId/nodes/:nodeName', function(req, res) {
        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });
            chef.getNode(req.params.nodeName, function(err, nodeData) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(nodeData);
                }
            });

        });
    });


    app.post('/chef/servers/:serverId/sync/nodes', function(req, res) {


        var taskStatusObj = null;
        var chef = null;
        var reqBody = req.body;
        var projectId = reqBody.projectId;
        var orgId = reqBody.orgId;
        var bgId = reqBody.bgId;
        var envId = reqBody.envId;
        var count = 0;

        var users = reqBody.users;
        if (!projectId) {
            res.send(400);
            return;
        }
        if (!users || !users.length) {
            res.send(400);
            return;
        }

        var insertNodeInMongo = function(node) {
            var platformId = '';
            if (!node.automatic) {
                node.automatic = {};
            }
            var nodeIp = 'unknown';
            if (node.automatic.ipaddress) {
                nodeIp = node.automatic.ipaddress;
            }

            if (node.automatic.cloud) {
                nodeIp = node.automatic.cloud.public_ipv4;
                if (node.automatic.cloud.provider === 'ec2') {
                    if (node.automatic.ec2) {
                        platformId = node.automatic.ec2.instance_id;
                    }
                }
            }

            var hardwareData = {
                platform: 'unknown',
                platformVersion: 'unknown',
                architecture: 'unknown',
                memory: {
                    total: 'unknown',
                    free: 'unknown',
                },
                os: 'linux'
            };
            if (node.automatic.os) {
                hardwareData.os = node.automatic.os;
            }
            if (node.automatic.kernel && node.automatic.kernel.machine) {
                hardwareData.architecture = node.automatic.kernel.machine;
            }
            if (node.automatic.platform) {
                hardwareData.platform = node.automatic.platform;
            }
            if (node.automatic.platform_version) {
                hardwareData.platformVersion = node.automatic.platform_version;
            }
            if (node.automatic.memory) {
                hardwareData.memory.total = node.automatic.memory.total;
                hardwareData.memory.free = node.automatic.memory.free;
            }
            var runlist = node.run_list;
            if (!runlist) {
                runlist = [];
            }

            if (hardwareData.platform === 'windows') {
                hardwareData.os = "windows";
            }

            function getCredentialsFromReq(callback) {
                var credentials = {};

                if (reqBody.credentials && reqBody.credentials.pemFileData) {
                    credentials = reqBody.credentials;
                    credentials.pemFileLocation = appConfig.tempDir + uuid.v4();
                    fileIo.writeFile(credentials.pemFileLocation, reqBody.credentials.pemFileData, null, function(err) {
                        if (err) {
                            console.log('unable to create pem file ', err);
                            callback(err, null);
                            return;
                        }
                        callback(null, credentials);
                    });

                } else {

                    if (!reqBody.credentials) {
                        var tempPemFileLocation = appConfig.tempDir + uuid.v4();
                        fileIo.copyFile(appConfig.aws.pemFileLocation + appConfig.aws.pemFile, tempPemFileLocation, function() {
                            if (err) {
                                console.log('unable to copy pem file ', err);
                                callback(err, null);
                                return;
                            }
                            credentials = {
                                username: appConfig.aws.instanceUserName,
                                pemFileLocation: tempPemFileLocation
                            }
                            callback(null, credentials);
                        });
                    } else {
                        callback(null, reqBody.credentials);
                    }
                }
            }

            getCredentialsFromReq(function(err, credentials) {
                if (err) {
                    console.log("unable to get credetials from request ", err);
                    return;
                }
                credentialCryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                    if (err) {
                        console.log("unable to encrypt credentials == >", err);
                        return;
                    }

                    console.log('nodeip ==> ', nodeIp);
                    console.log('alive ==> ', node.isAlive);
                    var instance = {
                        orgId: orgId,
                        bgId: bgId,
                        projectId: projectId,
                        envId: node.envId,
                        chefNodeName: node.name,
                        runlist: runlist,
                        platformId: platformId,
                        instanceIP: nodeIp,
                        instanceState: node.isAlive,
                        bootStrapStatus: 'success',
                        hardware: hardwareData,
                        credentials: encryptedCredentials,
                        users: users,
                        chef: {
                            serverId: req.params.serverId,
                            chefNodeName: node.name
                        },
                        blueprintData: {
                            blueprintName: node.name,
                            templateId: "chef_import",
                            iconPath: "../private/img/templateicons/chef_import.png"
                        }
                    }

                    instancesDao.createInstance(instance, function(err, data) {
                        if (err) {
                            console.log(err, 'occured in inserting node in mongo');
                            return;
                        }
                        logsDao.insertLog({
                            referenceId: data._id,
                            err: false,
                            log: "Node Imported",
                            timestamp: new Date().getTime()
                        });

                    });

                });
            });

        }

        function updateTaskStatusNode(nodeName, msg, err, i) {
            count++;
            var status = {};
            status.nodeName = nodeName;
            status.message = msg;
            status.err = err;

            console.log('taskstatus updated');

            if (count == reqBody.selectedNodes.length) {
                console.log('setting complete');
                taskstatus.endTaskStatus(true, status);
            } else {
                console.log('setting task status');
                taskstatus.updateTaskStatus(status);
            }

        };

        function importNodes(nodeList) {
            taskStatusModule.getTaskStatus(null, function(err, obj) {
                if (err) {
                    res.send(500);
                    return;
                }
                taskstatus = obj;
                for (var i = 0; i < nodeList.length; i++) {

                    (function(nodeName) {
                        chef.getNode(nodeName, function(err, node) {
                            if (err) {
                                console.log(err);
                                updateTaskStatusNode(nodeName, "Unable to import node " + nodeName, true, count);
                                return;
                            } else {

                                console.log('creating env ==>', node.chef_environment);
                                console.log('orgId ==>', orgId);
                                console.log('bgid ==>', bgId);
                                // console.log('node ===>', node);
                                environmentsDao.createEnv(node.chef_environment, orgId, bgId, projectId,envId, function(err, data) {

                                    if (err) {
                                        console.log(err, 'occured in creating environment in mongo');
                                        updateTaskStatusNode(node.name, "Unable to import node : " + node.name, true, count);
                                        return;
                                    }
                                    console.log('Env ID Received before instance create:' + data);
                                    node.envId = data;
                                    //fetching the ip of the imported node
                                    var nodeIp = 'unknown';
                                    if (node.automatic.ipaddress) {
                                        nodeIp = node.automatic.ipaddress;
                                    }

                                    if (node.automatic.cloud) {
                                        nodeIp = node.automatic.cloud.public_ipv4;
                                    }

                                    instancesDao.getInstanceByOrgAndNodeNameOrIP(orgId, node.name, nodeIp, function(err, instances) {
                                        if (err) {
                                            console.log('Unable to fetch instance', err);
                                            updateTaskStatusNode(node.name, "Unable to import node : " + node.name, true, count);
                                            return;
                                        }
                                        if (instances.length) {
                                            configmgmtDao.getOrgBgProjEnvNameFromIds(instances[0].orgId,instances[0].bgId,instances[0].projectId,instances[0].envId,function(err,names){
                                             if(err) {
                                                updateTaskStatusNode(node.name, "Unable to import node : " + node.name, true, count);
                                                return;
                                             }
                                             updateTaskStatusNode(node.name, "Node exist in " + names.orgName + "/" + names.bgName + "/" + names.projName + "/" + names.envName + " : " + node.name, true, count);
                                            });
                                            return;
                                        }
                                        if (nodeIp != 'unknown') {
                                            var cmd = 'ping -c 1 -w 1 ' + nodeIp;
                                            var curl = new Curl();
                                            console.log("Pinging Node to check if alive :" + cmd);
                                            curl.executecurl(cmd, function(err, stdout) {
                                                if (stdout) {
                                                    if (stdout.indexOf('1 received') > 0) {
                                                        node.isAlive = 'running';
                                                    } else {
                                                        node.isAlive = 'unknown';
                                                    }
                                                    //    console.log('node ===>', node);
                                                    insertNodeInMongo(node);
                                                    console.log('importing node ' + node.name);
                                                    updateTaskStatusNode(nodeName, "Node Imported : " + nodeName, false, count);
                                                }
                                            });
                                        } else {
                                            //     console.log('node ===>', node);
                                            node.isAlive = 'unknown';
                                            insertNodeInMongo(node);
                                            console.log('importing node ' + node.name);
                                            updateTaskStatusNode(nodeName, "Node Imported : " + nodeName, false, count);
                                        }
                                    });
                                });
                            }
                        });

                    })(nodeList[i]);
                }

                res.send(200, {
                    taskId: taskstatus.getTaskId()
                });
            });

        }

        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            if (!chefDetails) {
                res.send(404);
                return;
            }
            chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });
            if (reqBody.selectedNodes.length) {
                importNodes(reqBody.selectedNodes);
            } else {
                res.send(400);
            }
        });



    });

    app.post('/chef/environments/create', function(req, res) {

        var settings = appConfig.chef;
        var chef = new Chef(settings);
        chef.createEnvironment(req.body.envName, function(err, envName) {
            if (err) {
                res.send(500);
                return;
            } else {
                res.send(envName);
            }
        });

    });

    app.get('/chef/servers/:serverId/cookbooks', function(req, res) {

        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbooksList(function(err, cookbooks) {
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(cookbooks);
                }
            });


        });

    });

    app.get('/chef/servers/:serverId/cookbooks/:cookbookName', function(req, res) {

        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbook(req.params.cookbookName, function(err, cookbooks) {
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(cookbooks);
                }
            });


        });

    });



    app.get('/chef/servers/:serverId/receipeforcookbooks/:cookbookName', function(req, res) {

        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getReceipesForCookbook(req.params.cookbookName, function(err, cookbooks) {
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(cookbooks);
                }
            });


        });

    });


    app.get('/chef/servers/:serverId', function(req, res) {
        console.log(req.params.serverId);
        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            console.log("chefLog -->", chefDetails);
            if (chefDetails) {
                //var chefDetails = JSON.parse(chefJson);
                res.send({
                    serverId: chefDetails.rowid,
                    orgname: chefDetails.orgname,
                    orgname_new: chefDetails.orgname_new,
                    orgname_rowid: chefDetails.orgname_rowid
                });
            } else {
                res.send(404);
            }

        });

    });


    app.post('/chef/servers/:serverId/nodes/:nodename/updateEnv', function(req, res) {
        configmgmtDao.getChefServerDetails(req.params.serverId, function(err, chefDetails) {
            if (err) {
                console.log(err);
                res.send(500, errorResponses.chef.corruptChefData);
                return;
            }
            if (!chefDetails) {
                res.send(500, errorResponses.chef.corruptChefData);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });
            chef.updateNodeEnvironment(req.params.nodename, req.body.envName, function(err, success) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    if (success) {
                        res.send(200);
                    } else {
                        res.send(500);
                    }
                }
            });
        });
    });
};