var settingsController = require('../controller/settings');
var Chef = require('../classes/chef');
var EC2 = require('../classes/ec2');
var instancesDao = require('../classes/instances');
var environmentsDao = require('../classes/d4dmasters/environments.js');
var logsDao = require('../classes/dao/logsdao.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt');
var fileIo = require('../classes/utils/fileio');
var appConfig = require('../config/app_config');
var uuid = require('node-uuid');

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/chef/*', verificationFunc);

    app.get('/chef/servers/:serverId/nodes', function(req, res) {
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
            chef.getNodesDetailsForEachEnvironment(function(err, environmentList) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(environmentList);
                }
            });

        });
    });


    app.post('/chef/servers/:serverId/sync/nodes', function(req, res) {
        var reqBody = req.body;
        var projectId = reqBody.projectId;
        var orgId = reqBody.orgId;
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
            var nodeIp = node.ip;
            var nodeData = node.nodeData;
            if (!node.nodeData.automatic) {
                node.nodeData.automatic = {};
            }
            if (node.nodeData.automatic.ec2) {
                platformId = node.nodeData.automatic.ec2.instance_id;
                if (node.nodeData.automatic.ec2.public_ipv4) {
                    nodeIp = node.nodeData.automatic.ec2.public_ipv4;
                }
            }
            if (node.nodeData.automatic.ec2) {
                platformId = node.nodeData.automatic.ec2.instance_id;
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
            if (nodeData.automatic.kernel && nodeData.automatic.kernel.machine) {
                hardwareData.architecture = nodeData.automatic.kernel.machine;
            }
            if (nodeData.automatic.platform) {
                hardwareData.platform = nodeData.automatic.platform;
            }
            if (nodeData.automatic.platform_version) {
                hardwareData.platformVersion = nodeData.automatic.platform_version;
            }
            if (nodeData.automatic.memory) {
                hardwareData.memory.total = nodeData.automatic.memory.total;
                hardwareData.memory.free = nodeData.automatic.memory.free;
            }
            if (hardwareData.platform === 'windows') {
                hardwareData.os = 'windows';
            }


            console.log("runlist ==>", node.runlist);


            settingsController.getAwsSettings(function(settings) {
                var instanceCredentials = {};
                if (reqBody.credentials) {
                    instanceCredentials.username = reqBody.credentials.username;
                    console.log("credentials ==>",reqBody.credentials);
                    if (reqBody.credentials.password) {
                        instanceCredentials.password = reqBody.credentials.password;
                    } else {
                        if (reqBody.credentials.pemFileLocation) {
                            instanceCredentials.pemFileLocation = reqBody.credentials.pemFileLocation;
                        } else {
                            instanceCredentials.pemFileLocation = settings.pemFileLocation + settings.pemFile;
                        }
                    }
                } else {
                    instanceCredentials = {
                        username: settings.instanceUserName,
                        pemFileLocation: settings.pemFileLocation + settings.pemFile,
                    }
                }

                console.log('nodeip ==> ', nodeIp);

                var instance = {
                    orgId: orgId,
                    projectId: projectId,
                    envId: node.env,
                    chefNodeName: node.nodeName,
                    runlist: node.runlist,
                    platformId: platformId,
                    instanceIP: nodeIp,
                    instanceState: 'unknown',
                    bootStrapStatus: 'success',
                    hardware: hardwareData,
                    credentials: instanceCredentials,
                    users: users,
                    chef: {
                        serverId: req.params.serverId,
                        chefNodeName: node.nodeName
                    },
                    blueprintData: {
                        blueprintName: node.nodeName,
                        templateId: "chef_import"
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

        }

        function createEnv(node) {
            console.log('creating env ==>', node.env);
            console.log('orgId ==>', orgId);
            environmentsDao.createEnv(node.env, orgId, function(err, data) {
                count++;
                if (err) {
                    console.log(err, 'occured in creating environment in mongo');
                    return;
                }

                insertNodeInMongo(node);
                if (count === reqBody.selectedNodes.length) {
                    res.send(200);
                } else {
                    createEnv(reqBody.selectedNodes[count]);
                }
            })
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
            if (reqBody.selectedNodes.length) {

                if (reqBody.credentials && reqBody.credentials.pemFileData) {
                    reqBody.credentials.pemFileLocation = appConfig.instancePemFilesDir + uuid.v4();
                    fileIo.writeFile(reqBody.credentials.pemFileLocation, reqBody.credentials.pemFileData, null, function(err) {
                        if (err) {
                            console.log('unable to create pem file ', err);
                            res.send(500);
                            return;
                        }
                        createEnv(reqBody.selectedNodes[count]);
                    });

                } else {
                    createEnv(reqBody.selectedNodes[count]);
                }
            } else {
                res.send(400);
            }
        });



    });

    app.post('/chef/environments/create', function(req, res) {

        settingsController.getChefSettings(function(settings) {
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
                    orgname: chefDetails.orgname
                });
            } else {
                res.send(404);
            }

        });

    });



};