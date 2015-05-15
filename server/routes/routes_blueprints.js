var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/classes/instance/instance');
var EC2 = require('../lib/ec2.js');
var Chef = require('../lib/chef.js');
var logsDao = require('../model/dao/logsdao.js');
var Docker = require('../model/docker.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var usersDao = require('../model/users.js');
var appConfig = require('../config/app_config.js');
var Cryptography = require('../lib/utils/cryptography');
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var logger = require('../lib/logger')(module);
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var currentDirectory = __dirname;
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/blueprints/*', sessionVerificationFunc);

    // This post() Not in use
    app.post('/blueprints', function(req, res) {
        logger.debug("Enter post() for /blueprints");
        //validating if user has permission to save a blueprint
        logger.debug('Verifying User permission set');
        var user = req.session.user;
        var category = 'blueprints';
        var permissionto = 'create';

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);

                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }
            var blueprintData = req.body.blueprintData;

            //All comming with blueprintData
            /*blueprintData.orgId = req.body.orgId;
            blueprintData.bgId = req.body.bgId;
            blueprintData.projectId = req.body.projectId;
            blueprintData.envId = req.body.envId;
            blueprintData.imageId = req.body.imageId;
            blueprintData.providerId = req.body.providerId;*/
            if (!blueprintData.runlist) {
                blueprintData.runlist = [];
            }
            if (!blueprintData.users || !blueprintData.users.length) {
                res.send(400);
                return;
            }

            blueprintsDao.createBlueprint(blueprintData, function(err, data) {
                if (err) {
                    res.send(500);
                    return;
                }
                res.send(data);
            });
            logger.debug("Exit post() for /blueprints");
        });
    });

    app.post('/blueprints/:blueprintId/update', function(req, res) {
        logger.debug("Enter /blueprints/%s/update", req.params.blueprintId);

        if (req.session.user.rolename === 'Consumer') {
            res.send(401);
            return;
        }

        var blueprintUpdateData = req.body.blueprintUpdateData;
        if (!blueprintUpdateData.runlist) {
            blueprintUpdateData.runlist = [];
        }

        //blueprintUpdateData.runlist.splice(0, 0, 'recipe[ohai]');

        logger.debug("Blueprint Data = %s", blueprintUpdateData);
        blueprintsDao.updateBlueprint(req.params.blueprintId, blueprintUpdateData, function(err, data) {
            if (err) {
                logger.error("Blueprint Updated Failed >> ", err);
                res.send(500);
                return;
            }

            if (!data) {
                logger.error("Exit /blueprints/%s/update. Update Failed. No Such Blueprint", req.params.blueprintId);
                res.send(404)
            } else {
                logger.debug("Exit /blueprints/%s/update. Update Successful", req.params.blueprintId);
                res.send({
                    version: data.version
                });
            }

        });
    }); // end app.post('/blueprints/:blueprintId/update' )

    app.get('/blueprints/:blueprintId/versions/:version', function(req, res) {
        logger.debug("Enter /blueprints/%s/versions/%s", req.params.blueprintId, req.params.version);
        blueprintsDao.getBlueprintVersionData(req.params.blueprintId, req.params.version, function(err, data) {
            if (err) {
                logger.debug("Failed to get blueprint versions ", err);
                res.send(500);
                return;
            }

            if (!data.length) {
                logger.error("No such blueprint or blueprint version");
                res.send(404);
                return;
            }

            logger.debug("Exit /blueprints/%s/versions/%s (Success)", req.params.blueprintId, req.params.version);
            res.send(data[0]);
        });
    });

    app.get('/blueprints/delete/:blueprintId', function(req, res) {
        logger.debug("Enter /blueprints/delete/%s", req.params.blueprintId);
        blueprintsDao.removeBlueprintbyId(req.params.blueprintId, function(err, data) {
            if (err) {
                logger.error("Failed to delete blueprint>>", err);
                res.send(500);
                return;
            }

            logger.debug("Exit /blueprints/delete/%s", req.params.blueprintId);
            res.end('OK');
        });
    });


    app.get('/blueprints/:blueprintId/launch', function(req, res) {
        logger.debug("Enter /blueprints/%s/launch", req.params.blueprintId);
        //verifying if the user has permission
        logger.debug('Verifying User permission set for execute.');
        var user = req.session.user;
        var category = 'blueprints';
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
                        if (err) {
                            logger.error('Failed to getBlueprint. Error = ', err);
                            res.send(500);
                            return;
                        }
                        if (data.length) {
                            logger.debug("getBlueprintById returned this >> ", data);
                            var blueprint = data[0];
                            var launchVersionNumber = blueprint.latestVersion;
                            if (req.query.version) {
                                launchVersionNumber = req.query.version;
                            }
                            logger.debug("req.query.version = %s and launchVersionNumber = %s", req.query.version, launchVersionNumber);
                            var version;
                            for (var i = 0; i < blueprint.versionsList.length; i++) {
                                if (blueprint.versionsList[i].ver === launchVersionNumber) {
                                    version = blueprint.versionsList[i];
                                    break;
                                }
                            }
                            if (!version) {
                                logger.debug("No blueprint version available ( 404 )");
                                res.send(404);
                                return;
                            }
                            logger.debug('Using Chef serverid : %s', blueprint.chefServerId);
                            //logger.debug("Using blueprint version ==>", version);
                            configmgmtDao.getEnvNameFromEnvId(blueprint.envId, function(err, envName) {
                                if (err) {
                                    res.send(500);
                                    return;
                                }
                                console.log('envName', envName);
                                configmgmtDao.getChefServerDetails(blueprint.chefServerId, function(err, chefDetails) {
                                    if (err) {
                                        logger.error("Failed to getChefServerDetails", err);
                                        res.send(500);
                                        return;
                                    }
                                    if (!chefDetails) {
                                        logger.error("No CHef Server Detailed available.", err);
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

                                    logger.debug('Chef Repo Location = ', chefDetails.chefRepoLocation);

                                    VMImage.getImageById(blueprint.imageId, function(err, anImage) {
                                        if (err) {
                                            logger.error(err);
                                            res.send(500, errorResponses.db.error);
                                            return;
                                        }
                                        logger.debug("Loaded Image: >>>>>>>>>>> %s", anImage.providerId);
                                        AWSProvider.getAWSProviderById(anImage.providerId, function(err, aProvider) {
                                            if (err) {
                                                logger.error(err);
                                                res.send(500, errorResponses.db.error);
                                                return;
                                            }
                                            AWSKeyPair.getAWSKeyPairById(blueprint.keyPairId, function(err, aKeyPair) {
                                                if (err) {
                                                    logger.error(err);
                                                    res.send(500, errorResponses.db.error);
                                                    return;
                                                }


                                                function launchInstance() {
                                                    logger.debug("Enter launchInstance");
                                                    // New add
                                                    //var encryptedPemFileLocation= currentDirectory + '/../catdata/catalyst/provider-pemfiles/';

                                                    var settings = appConfig;
                                                    //encrypting default pem file
                                                    var cryptoConfig = appConfig.cryptoSettings;
                                                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                    var encryptedPemFileLocation = settings.instancePemFilesDir + aKeyPair._id;
                                                    var securityGroupIds = [];
                                                    for (var i = 0; i < blueprint.securityGroupIds.length; i++) {
                                                        securityGroupIds.push(blueprint.securityGroupIds[i]);
                                                    }

                                                    logger.debug("encryptFile of %s successful", encryptedPemFileLocation);
                                                    var awsSettings = {
                                                        "access_key": aProvider.accessKey,
                                                        "secret_key": aProvider.secretKey,
                                                        "region": aKeyPair.region,
                                                        "keyPairName": aKeyPair.keyPairName
                                                    };
                                                    var ec2 = new EC2(awsSettings);
                                                    ec2.launchInstance(anImage.imageIdentifier, blueprint.instanceType, securityGroupIds, blueprint.subnetId, 'D4D-' + blueprint.name, aKeyPair.keyPairName, function(err, instanceData) {
                                                        if (err) {
                                                            logger.error("launchInstance Failed >> ", err);
                                                            res.send(500);
                                                            return;
                                                        }

                                                        logger.debug("Instance Launched. Runlist = ", version.runlist);
                                                        logger.debug("Instance Launched. Instance data = ", instanceData);
                                                        logger.debug("UserName:::::::::: ", anImage.userName);
                                                        var instance = {
                                                            name: "",
                                                            orgId: blueprint.orgId,
                                                            bgId: blueprint.bgId,
                                                            projectId: blueprint.projectId,
                                                            envId: blueprint.envId,
                                                            providerId: blueprint.providerId,
                                                            keyPairId: blueprint.keyPairId,
                                                            chefNodeName: instanceData.InstanceId,
                                                            runlist: version.runlist,
                                                            platformId: instanceData.InstanceId,
                                                            appUrls: blueprint.appUrls,
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
                                                                username: anImage.userName,
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

                                                        logger.debug('Creating instance in catalyst');
                                                        instancesDao.createInstance(instance, function(err, data) {
                                                            if (err) {
                                                                logger.error("Failed to create Instance", err);
                                                                res.send(500);
                                                                return;
                                                            }
                                                            instance.id = data._id;
                                                            var timestampStarted = new Date().getTime();
                                                            var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, req.session.user.cn, timestampStarted);
                                                            var logsReferenceIds = [instance.id, actionLog._id];
                                                            logsDao.insertLog({
                                                                referenceId: logsReferenceIds,
                                                                err: false,
                                                                log: "Starting instance",
                                                                timestamp: timestampStarted
                                                            });
                                                            //For windows instance handle another check..

                                                            ec2.waitForInstanceRunnnigState(instance.platformId, function(err, instanceData) {
                                                                if (err) {
                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: true,
                                                                        log: "Instance ready state wait failed. Unable to bootstrap",
                                                                        timestamp: timestampStarted
                                                                    });
                                                                    logger.error("waitForInstanceRunnnigState returned an error  >>", err);
                                                                    return;
                                                                }
                                                                logger.debug("Enter waitForInstanceRunnnigState :", instanceData);
                                                                instance.instanceIP = instanceData.PublicIpAddress;
                                                                instancesDao.updateInstanceIp(instance.id, instanceData.PublicIpAddress, function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("instancesDao.updateInstanceIp Failed ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('Instance ip upadated');
                                                                });

                                                                instancesDao.updateInstanceState(instance.id, instanceData.State.Name, function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("error(date instance state err ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('instance state upadated');
                                                                });

                                                                logger.debug('waiting for instance');
                                                                logsDao.insertLog({
                                                                    referenceId: logsReferenceIds,
                                                                    err: false,
                                                                    log: "waiting for instance state to be ok",
                                                                    timestamp: timestampStarted
                                                                });
                                                                ec2.waitForEvent(instanceData.InstanceId, 'instanceStatusOk', function(err) {
                                                                    if (err) {
                                                                        logsDao.insertLog({
                                                                            referenceId: logsReferenceIds,
                                                                            err: true,
                                                                            log: "Instance ok state wait failed. Unable to bootstrap",
                                                                            timestamp: timestampStarted
                                                                        });
                                                                        logger.error('intance wait failed ==> ', openport, err);
                                                                        return;
                                                                    }

                                                                    logger.debug('intance wait success');

                                                                    logger.debug('****************************');
                                                                    logger.debug('User Name:' + instance.credentials.username, ' pemFile' + instance.credentials.pemFileLocation);
                                                                    logger.debug('Chef Details ' + JSON.stringify(chef));
                                                                    logger.debug('****************************');

                                                                    //decrypting pem file
                                                                    var cryptoConfig = appConfig.cryptoSettings;
                                                                    var tempUncryptedPemFileLoc = appConfig.tempDir + uuid.v4();
                                                                    cryptography.decryptFile(instance.credentials.pemFileLocation, cryptoConfig.decryptionEncoding, tempUncryptedPemFileLoc, cryptoConfig.encryptionEncoding, function(err) {
                                                                        if (err) {
                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                                                if (err) {
                                                                                    logger.error("Unable to set instance bootstarp status", err);
                                                                                } else {
                                                                                    logger.debug("Instance bootstrap status set to failed");
                                                                                }
                                                                            });
                                                                            var timestampEnded = new Date().getTime();
                                                                            logsDao.insertLog({
                                                                                referenceId: logsReferenceIds,
                                                                                err: true,
                                                                                log: "Unable to decrpt pem file. Bootstrap failed",
                                                                                timestamp: timestampEnded
                                                                            });
                                                                            instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);

                                                                            if (instance.hardware.os != 'windows')
                                                                                return;
                                                                        }
                                                                        chef.bootstrapInstance({
                                                                            instanceIp: instance.instanceIP,
                                                                            pemFilePath: tempUncryptedPemFileLoc,
                                                                            runlist: instance.runlist,
                                                                            instanceUsername: instance.credentials.username,
                                                                            nodeName: instance.chef.chefNodeName,
                                                                            environment: envName,
                                                                            instanceOS: instance.hardware.os
                                                                        }, function(err, code) {

                                                                            fileIo.removeFile(tempUncryptedPemFileLoc, function(err) {
                                                                                if (err) {
                                                                                    logger.error("Unable to delete temp pem file =>", err);
                                                                                } else {
                                                                                    logger.debug("temp pem file deleted =>", err);
                                                                                }
                                                                            });


                                                                            logger.error('process stopped ==> ', err, code);
                                                                            if (err) {
                                                                                logger.error("knife launch err ==>", err);
                                                                                instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                                                                });
                                                                                var timestampEnded = new Date().getTime();
                                                                                logsDao.insertLog({
                                                                                    referenceId: logsReferenceIds,
                                                                                    err: true,
                                                                                    log: "Bootstrap failed",
                                                                                    timestamp: timestampEnded
                                                                                });
                                                                                instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);


                                                                            } else {
                                                                                if (code == 0) {
                                                                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                        if (err) {
                                                                                            logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                                        } else {
                                                                                            logger.debug("Instance bootstrap status set to success");
                                                                                        }
                                                                                    });
                                                                                    var timestampEnded = new Date().getTime();
                                                                                    logsDao.insertLog({
                                                                                        referenceId: logsReferenceIds,
                                                                                        err: false,
                                                                                        log: "Instance Bootstraped successessfully",
                                                                                        timestamp: timestampEnded
                                                                                    });
                                                                                    instancesDao.updateActionLog(instance.id, actionLog._id, true, timestampEnded);


                                                                                    chef.getNode(instance.chefNodeName, function(err, nodeData) {
                                                                                        if (err) {
                                                                                            logger.error("Failed chef.getNode", err);
                                                                                            return;
                                                                                        }
                                                                                        var hardwareData = {};
                                                                                        hardwareData.architecture = nodeData.automatic.kernel.machine;
                                                                                        hardwareData.platform = nodeData.automatic.platform;
                                                                                        hardwareData.platformVersion = nodeData.automatic.platform_version;
                                                                                        hardwareData.memory = {
                                                                                            total: 'unknown',
                                                                                            free: 'unknown'
                                                                                        };
                                                                                        if (nodeData.automatic.memory) {
                                                                                            hardwareData.memory.total = nodeData.automatic.memory.total;
                                                                                            hardwareData.memory.free = nodeData.automatic.memory.free;
                                                                                        }
                                                                                        hardwareData.os = instance.hardware.os;
                                                                                        instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                                                                            if (err) {
                                                                                                logger.error("Unable to set instance hardware details  code (setHardwareDetails)", err);
                                                                                            } else {
                                                                                                logger.debug("Instance hardware details set successessfully");
                                                                                            }
                                                                                        });
                                                                                        //Checking docker status and updating
                                                                                        var _docker = new Docker();
                                                                                        _docker.checkDockerStatus(instance.id,
                                                                                            function(err, retCode) {
                                                                                                if (err) {
                                                                                                    logger.error("Failed _docker.checkDockerStatus", err);
                                                                                                    res.send(500);
                                                                                                    return;
                                                                                                    //res.end('200');

                                                                                                }
                                                                                                logger.debug('Docker Check Returned:' + retCode);
                                                                                                if (retCode == '0') {
                                                                                                    instancesDao.updateInstanceDockerStatus(instance.id, "success", '', function(data) {
                                                                                                        logger.debug('Instance Docker Status set to Success');
                                                                                                    });

                                                                                                }
                                                                                            });

                                                                                    });

                                                                                } else {
                                                                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                                                        if (err) {
                                                                                            logger.error("Unable to set instance bootstarp status code != 0", err);
                                                                                        } else {
                                                                                            logger.debug("Instance bootstrap status set to failed");
                                                                                        }
                                                                                    });
                                                                                    var timestampEnded = new Date().getTime();
                                                                                    logsDao.insertLog({
                                                                                        referenceId: logsReferenceIds,
                                                                                        err: false,
                                                                                        log: "Bootstraped Failed",
                                                                                        timestamp: timestampEnded
                                                                                    });
                                                                                    instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);

                                                                                }
                                                                            }

                                                                        }, function(stdOutData) {

                                                                            logsDao.insertLog({
                                                                                referenceId: logsReferenceIds,
                                                                                err: false,
                                                                                log: stdOutData.toString('ascii'),
                                                                                timestamp: new Date().getTime()
                                                                            });

                                                                        }, function(stdErrData) {

                                                                            //retrying 4 times before giving up.
                                                                            logsDao.insertLog({
                                                                                referenceId: logsReferenceIds,
                                                                                err: true,
                                                                                log: stdErrData.toString('ascii'),
                                                                                timestamp: new Date().getTime()
                                                                            });


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

                                                }


                                                chef.getEnvironment(blueprint.envId, function(err, env) {
                                                    if (err) {
                                                        logger.error("Failed chef.getEnvironment", err);
                                                        res.send(500);
                                                        return;
                                                    }

                                                    if (!env) {
                                                        logger.debug("Blueprint ID = ", blueprint.envId);
                                                        chef.createEnvironment(blueprint.envId, function(err, envName) {
                                                            if (err) {
                                                                logger.error("Failed chef.createEnvironment", err);
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
                                        });
                                    });
                                });
                            });


                        } else {
                            res.send(404, {
                                message: "Blueprint Not Found"
                            });
                        }
                    });
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }
            return;

        }); // end haspermission
    });


    app.post('/blueprints/:blueprintId/provision', function(req, res) {
        logger.debug("Enter /blueprints/%s/provision", req.params.blueprintId);

        blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
            if (err) {
                logger.error("getBlueprintById Failed", err);
                res.send(500);
                return;
            }
            if (data.length) {
                var blueprint = data[0];
                var launchVersionNumber = blueprint.latestVersion;
                if (req.query.version) {
                    launchVersionNumber = req.body.version;
                }
                logger.debug('Launching Version ::', launchVersionNumber);

                var version;
                for (var i = 0; i < blueprint.versionsList.length; i++) {
                    if (blueprint.versionsList[i].ver === blueprint.latestVersion) {
                        version = blueprint.versionsList[i];
                        break;
                    }
                }
                if (!version) {
                    logger.debug("No Blueprint Version Found");
                    res.send(404);
                    return;
                }

                configmgmtDao.getChefServerDetails(blueprint.chefServerId, function(err, chefDetails) {
                    if (err) {
                        logger.error("Unable to get Chef Server Details found in blueprint", err);
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        logger.error("No Chef Server Details in Blueprint");
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
                            appUrl1: blueprint.appUrl1,
                            appUrl2: blueprint.appUrl2,
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
                                logger.error("Failed to create an instance from blueprint", err);
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

                                logger.error('process stopped ==> ', err, code);
                                if (err) {
                                    logger.error("knife launch err ==>", err);
                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                    });
                                } else {
                                    if (code == 0) {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                            if (err) {
                                                logger.error("Unable to set instance bootstarp status", err);
                                            } else {
                                                logger.debug("Instance bootstrap status set to success");
                                            }
                                        });

                                        chef.getNode(instance.chefNodeName, function(err, nodeData) {
                                            if (err) {
                                                logger.error("Unable to get Node", err);
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
                                                    logger.error("Unable to set instance hardware details", err);
                                                } else {
                                                    logger.debug("Instance hardware details set successessfully");
                                                }
                                            });
                                        });

                                    } else {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                            if (err) {
                                                logger.error("Unable to set instance bootstarp status", err);
                                            } else {
                                                logger.debug("Instance bootstrap status set to failed");
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
                            logger.error("Error in chef.getEnvironment", err);
                            res.send(500);
                            return;
                        }

                        if (!env) {
                            logger.debug(blueprint.envId);
                            chef.createEnvironment(blueprint.envId, function(err, envName) {
                                if (err) {
                                    logger.error("Error in chef.createEnvironment", err);
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