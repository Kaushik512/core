var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../classes/ec2.js');
var Chef = require('../classes/chef.js');
var logsDao = require('../classes/dao/logsdao.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt');
var appConfig = require('../config/app_config.js');
var Cryptography = require('../classes/utils/cryptography');
var fileIo = require('../classes/utils/fileio');
var uuid = require('node-uuid');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/blueprints/*', sessionVerificationFunc);



    app.post('/blueprints/:blueprintId/update', function(req, res) {

        var blueprintUpdateData = req.body.blueprintUpdateData;
        if (!blueprintUpdateData.runlist) {
            blueprintUpdateData.runlist = [];
        }
        //blueprintUpdateData.runlist.splice(0, 0, 'recipe[ohai]');


        blueprintsDao.updateBlueprint(req.params.blueprintId, blueprintUpdateData, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            if (!data) {
                res.send(404)
            } else {
                res.send({
                    version: data.version
                });
            }

        });
    });

    app.get('/blueprints/:blueprintId/versions/:version', function(req, res) {

        blueprintsDao.getBlueprintVersionData(req.params.blueprintId, req.params.version, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            if (!data.length) {
                res.send(404);
                return;
            }
            res.send(data[0]);


        });
    });

    app.get('/blueprints/delete/:blueprintId', function(req, res) {

        blueprintsDao.removeBlueprintbyId(req.params.blueprintId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            res.end('OK');


        });
    });


    app.get('/blueprints/:blueprintId/launch', function(req, res) {

        console.log('Entered Launch');
        blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
            if (err) {
                console.log('getBlueprintByID Error:', err);
                res.send(500);
                return;
            }
            if (data.length) {
                var blueprint = data[0];
                var launchVersionNumber = blueprint.latestVersion;
                if (req.query.version) {
                    console.log('in version');
                    launchVersionNumber = req.query.version;
                }
                console.log("query v==>", req.query.version, launchVersionNumber);
                var version;
                for (var i = 0; i < blueprint.versionsList.length; i++) {
                    if (blueprint.versionsList[i].ver === launchVersionNumber) {
                        version = blueprint.versionsList[i];
                        break;
                    }
                }
                if (!version) {
                    res.send(404);
                    return;
                }
                console.log('chef serverid : ', blueprint.chefServerId);
                console.log("version ==>", version);
                configmgmtDao.getChefServerDetails(blueprint.chefServerId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(500);
                        return;
                    }
                    var chef = new Chef({
                        userChefRepoLocation: chefDetails.chefRepoLocation,
                        chefUserName: chefDetails.loginname,
                        chefUserPemFile: chefDetails.userpemfile,
                        chefValidationPemFile: chefDetails.validatorpemfile,
                        hostedChefUrl: chefDetails.url
                    });
                    console.log('*************************');
                    console.log('Chef ' + chefDetails.chefRepoLocation);

                    function launchInstance() {

                        var settings = appConfig;
                        //encrypting default pem file
                        var cryptoConfig = appConfig.cryptoSettings;
                        var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                        var encryptedPemFileLocation = settings.instancePemFilesDir + uuid.v4();
                        cryptography.encryptFile(settings.aws.pemFileLocation + settings.aws.pemFile, cryptoConfig.inputEncoding, encryptedPemFileLocation, cryptoConfig.outputEncoding, function(err) {
                            if (err) {
                                console.log(err);
                                res.send(500);
                                return;
                            }

                            var ec2 = new EC2(settings.aws);
                            ec2.launchInstance(blueprint.instanceAmiid, blueprint.instanceType, settings.aws.securityGroupId, function(err, instanceData) {
                                if (err) {
                                    console.log(err);
                                    res.send(500);
                                    return;
                                }

                                console.log(version.runlist);
                                console.log(instanceData);
                                var instance = {
                                    orgId: blueprint.orgId,
                                    projectId: blueprint.projectId,
                                    envId: blueprint.envId,
                                    chefNodeName: instanceData.InstanceId,
                                    runlist: version.runlist,
                                    platformId: instanceData.InstanceId,
                                    instanceIP: instanceData.PublicIpAddress,
                                    instanceState: instanceData.State.Name,
                                    bootStrapStatus: 'waiting',
                                    users: blueprint.users,
                                    hardware: {
                                        platform: 'unknown',
                                        platformVersion: 'unknown',
                                        architecture: 'unknown',
                                        memory: {
                                            total: 'unknown',
                                            free: 'unknown',
                                        },
                                        os: blueprint.instanceOS
                                    },
                                    credentials: {
                                        username: blueprint.instanceUsername,
                                        pemFileLocation: encryptedPemFileLocation,
                                    },
                                    chef: {
                                        serverId: blueprint.chefServerId,
                                        chefNodeName: instanceData.InstanceId
                                    },
                                    blueprintData: {
                                        blueprintId: blueprint._id,
                                        blueprintName: blueprint.name,
                                        templateId: blueprint.templateId,
                                        templateType: blueprint.templateType,
                                        templateComponents: blueprint.templateComponents,
                                        iconPath: blueprint.iconpath
                                    }
                                }
                                instancesDao.createInstance(instance, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                        res.send(500);
                                        return;
                                    }
                                    instance.id = data._id;

                                    logsDao.insertLog({
                                        referenceId: instance.id,
                                        err: false,
                                        log: "Starting instance",
                                        timestamp: new Date().getTime()
                                    }, function(err, data) {
                                        if (err) {
                                            console.log('unable to update log');
                                            return;
                                        }
                                        console.log('log updated');
                                    });

                                    ec2.waitForInstanceRunnnigState(instance.platformId, function(err, instanceData) {
                                        if (err) {
                                            return;
                                        }
                                        console.log(instanceData);
                                        instance.instanceIP = instanceData.PublicIpAddress;
                                        instancesDao.updateInstanceIp(instance.id, instanceData.PublicIpAddress, function(err, updateCount) {
                                            if (err) {
                                                console.log("update instance ip err ==>", err);
                                                return;
                                            }
                                            console.log('instance ip upadated');
                                        });

                                        instancesDao.updateInstanceState(instance.id, instanceData.State.Name, function(err, updateCount) {
                                            if (err) {
                                                console.log("update instance state err ==>", err);
                                                return;
                                            }
                                            console.log('instance state upadated');
                                        });


                                        console.log('****************************');
                                        console.log('UN:' + instance.credentials.username, ' pemFile' + instance.credentials.pemFileLocation);
                                        console.log('Chef ' + JSON.stringify(chef));
                                        console.log('****************************');

                                        //decrypting pem file
                                        var cryptoConfig = appConfig.cryptoSettings;
                                        var tempUncryptedPemFileLoc = appConfig.tempDir + uuid.v4();
                                        cryptography.decryptFile(instance.credentials.pemFileLocation, cryptoConfig.inputEncoding, tempUncryptedPemFileLoc, cryptoConfig.outputEncoding, function(err) {
                                            if (err) {
                                                instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                    if (err) {
                                                        console.log("Unable to set instance bootstarp status");
                                                    } else {
                                                        console.log("Instance bootstrap status set to failed");
                                                    }
                                                });
                                                logsDao.insertLog({
                                                    referenceId: instance.id,
                                                    err: true,
                                                    log: "Unable to decrpt pem file. Bootstrap failed",
                                                    timestamp: new Date().getTime()
                                                });
                                                return;
                                            }
                                            chef.bootstrapInstance({
                                                instanceIp: instance.instanceIP,
                                                pemFilePath: tempUncryptedPemFileLoc,
                                                runlist: instance.runlist,
                                                instanceUsername: instance.credentials.username,
                                                nodeName: instance.chef.chefNodeName,
                                                environment: instance.envId,
                                                instanceOS: instance.hardware.os
                                            }, function(err, code) {

                                                fileIo.removeFile(tempUncryptedPemFileLoc, function(err) {
                                                    if (err) {
                                                        console.log("Unable to delete temp pem file =>", err);
                                                    } else {
                                                        console.log("temp pem file deleted =>", err);
                                                    }
                                                });


                                                console.log('process stopped ==> ', err, code);
                                                if (err) {
                                                    console.log("knife launch err ==>", err);
                                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                                    });

                                                } else {
                                                    if (code == 0) {
                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                            if (err) {
                                                                console.log("Unable to set instance bootstarp status");
                                                            } else {
                                                                console.log("Instance bootstrap status set to success");
                                                            }
                                                        });

                                                        chef.getNode(instance.chefNodeName, function(err, nodeData) {
                                                            if (err) {
                                                                console.log(err);
                                                                return;
                                                            }
                                                            var hardwareData = {};
                                                            hardwareData.architecture = nodeData.automatic.kernel.machine;
                                                            hardwareData.platform = nodeData.automatic.platform;
                                                            hardwareData.platformVersion = nodeData.automatic.platform_version;
                                                            hardwareData.memory = {};
                                                            hardwareData.memory.total = nodeData.automatic.memory.total;
                                                            hardwareData.memory.free = nodeData.automatic.memory.free;
                                                            hardwareData.os = instance.hardware.os;
                                                            //console.log(instance);
                                                            //console.log(hardwareData,'==',instance.hardware.os);
                                                            instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    console.log("Unable to set instance hardware details");
                                                                } else {
                                                                    console.log("Instance hardware details set successessfully");
                                                                }
                                                            });
                                                        });

                                                    } else {
                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                            if (err) {
                                                                console.log("Unable to set instance bootstarp status");
                                                            } else {
                                                                console.log("Instance bootstrap status set to failed");
                                                            }
                                                        });

                                                    }
                                                }

                                            }, function(stdOutData) {

                                                logsDao.insertLog({
                                                    referenceId: instance.id,
                                                    err: false,
                                                    log: stdOutData.toString('ascii'),
                                                    timestamp: new Date().getTime()
                                                });

                                            }, function(stdErrData) {

                                                logsDao.insertLog({
                                                    referenceId: instance.id,
                                                    err: true,
                                                    log: stdErrData.toString('ascii'),
                                                    timestamp: new Date().getTime()
                                                });


                                            });

                                        });
                                    });

                                    res.send(200, {
                                        "id": instance.id,
                                        "message": "instance launch success"
                                    });
                                });


                            });

                        });

                    }

                    chef.getEnvironment(blueprint.envId, function(err, env) {
                        if (err) {
                            console.log(err);
                            res.send(500);
                            return;
                        }

                        if (!env) {
                            console.log(blueprint.envId);
                            chef.createEnvironment(blueprint.envId, function(err, envName) {
                                if (err) {
                                    res.send(500);
                                    return;
                                }
                                launchInstance();

                            });
                        } else {
                            launchInstance();
                        }

                    });
                });



            } else {
                res.send(404, {
                    message: "Blueprint Not Found"
                });
            }
        });
    });


    app.post('/blueprints/:blueprintId/provision', function(req, res) {
        console.log('body ==>', req.body);
        blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }
            if (data.length) {
                var blueprint = data[0];
                var launchVersionNumber = blueprint.latestVersion;
                if (req.query.version) {
                    launchVersionNumber = req.body.version;
                }
                var version;
                for (var i = 0; i < blueprint.versionsList.length; i++) {
                    if (blueprint.versionsList[i].ver === blueprint.latestVersion) {
                        version = blueprint.versionsList[i];
                        break;
                    }
                }
                if (!version) {
                    res.send(404);
                    return;
                }
                configmgmtDao.getChefServerDetails(blueprint.chefServerId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(500);
                        return;
                    }
                    var chef = new Chef({
                        userChefRepoLocation: chefDetails.chefRepoLocation,
                        chefUserName: chefDetails.loginname,
                        chefUserPemFile: chefDetails.userpemfile,
                        chefValidationPemFile: chefDetails.validatorpemfile,
                        hostedChefUrl: chefDetails.url,
                    });

                    function provisionInstance() {

                        var instance = {
                            orgId: blueprint.projectId,
                            projectId: blueprint.projectId,
                            envId: blueprint.envId,
                            chefNodeName: req.body.instanceIP,
                            runlist: version.runlist,
                            platformId: 'datacenter',
                            instanceIP: req.body.instanceIP,
                            instanceState: 'running',
                            bootStrapStatus: 'waiting',
                            users: blueprint.users,
                            hardware: {
                                platform: 'unknown',
                                platformVersion: 'unknown',
                                architecture: 'unknown',
                                memory: {
                                    total: 'unknown',
                                    free: 'unknown',
                                },
                                os: blueprint.instanceOS
                            },
                            chef: {
                                serverId: blueprint.chefServerId,
                                chefNodeName: req.body.instanceIP
                            },
                            credentials: {
                                username: req.body.username,
                                password: req.body.password,
                            },
                            blueprintData: {
                                blueprintId: blueprint._id,
                                blueprintName: blueprint.name,
                                templateId: blueprint.templateId,
                                templateType: blueprint.templateType,
                                templateComponents: blueprint.templateComponents
                            }
                        }

                        instancesDao.createInstance(instance, function(err, data) {
                            if (err) {
                                console.log(err);
                                res.send(500);
                                return;
                            }
                            instance.id = data._id;

                            logsDao.insertLog({
                                referenceId: instance.id,
                                err: false,
                                log: "Provisioning Instance",
                                timestamp: new Date().getTime()
                            });
                            logsDao.insertLog({
                                referenceId: instance.id,
                                err: false,
                                log: "Bootstrapping Instance",
                                timestamp: new Date().getTime()
                            });
                            chef.bootstrapInstance({
                                instanceIp: instance.instanceIP,
                                runlist: instance.runlist,
                                instanceUsername: instance.credentials.username,
                                instancePassword: instance.credentials.password,
                                nodeName: instance.chef.chefNodeName,
                                environment: instance.envId,
                                instanceOS: instance.hardware.os
                            }, function(err, code) {

                                console.log('process stopped ==> ', err, code);
                                if (err) {
                                    console.log("knife launch err ==>", err);
                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                    });
                                } else {
                                    if (code == 0) {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                            if (err) {
                                                console.log("Unable to set instance bootstarp status");
                                            } else {
                                                console.log("Instance bootstrap status set to success");
                                            }
                                        });

                                        chef.getNode(instance.chefNodeName, function(err, nodeData) {
                                            if (err) {
                                                console.log(err);
                                                return;
                                            }
                                            var hardwareData = {};
                                            hardwareData.architecture = nodeData.automatic.kernel.machine;
                                            hardwareData.platform = nodeData.automatic.platform;
                                            hardwareData.platformVersion = nodeData.automatic.platform_version;
                                            hardwareData.memory = {};
                                            hardwareData.memory.total = nodeData.automatic.memory.total;
                                            hardwareData.memory.free = nodeData.automatic.memory.free;
                                            hardwareData.os = instance.hardware.os;
                                            instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                                if (err) {
                                                    console.log(err);
                                                    console.log("Unable to set instance hardware details");
                                                } else {
                                                    console.log("Instance hardware details set successessfully");
                                                }
                                            });
                                        });

                                    } else {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                            if (err) {
                                                console.log("Unable to set instance bootstarp status");
                                            } else {
                                                console.log("Instance bootstrap status set to failed");
                                            }
                                        });

                                    }
                                }

                            }, function(stdOutData) {

                                logsDao.insertLog({
                                    referenceId: instance.id,
                                    err: false,
                                    log: stdOutData.toString('ascii'),
                                    timestamp: new Date().getTime()
                                });

                            }, function(stdErrData) {

                                logsDao.insertLog({
                                    referenceId: instance.id,
                                    err: true,
                                    log: stdErrData.toString('ascii'),
                                    timestamp: new Date().getTime()
                                });

                            });

                            res.send(200, {
                                "id": instance.id,
                                "message": "instance launch success"
                            });
                        });

                    }

                    chef.getEnvironment(blueprint.envId, function(err, env) {
                        if (err) {
                            console.log(err);
                            res.send(500);
                            return;
                        }

                        if (!env) {
                            console.log(blueprint.envId);
                            chef.createEnvironment(blueprint.envId, function(err, envName) {
                                if (err) {
                                    res.send(500);
                                    return;
                                }
                                provisionInstance();

                            });
                        } else {
                            provisionInstance();
                        }

                    });
                });
            } else {
                res.send(404);
            }
        });

    });

};