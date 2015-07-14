var blueprintsDao = require('../model/dao/blueprints');
var Blueprints = require('_pr/model/blueprint');

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
            if (!req.body.blueprintData.runlist) {
                req.body.blueprintData.runlist = [];
            }
            var blueprintData = {
                orgId: req.body.blueprintData.orgId,
                bgId: req.body.blueprintData.bgId,
                projectId: req.body.blueprintData.projectId,
                name: req.body.blueprintData.name,
                appUrls: req.body.blueprintData.appUrls,
                iconpath: req.body.blueprintData.iconpath,
                templateId: req.body.blueprintData.templateId,
                templateType: req.body.blueprintData.templateType,
                users: req.body.blueprintData.users,
                blueprintType: req.body.blueprintData.blueprintType
            };

            var dockerData, instanceData;
            logger.debug('req.body.blueprintData.blueprintType ==>', req.body.blueprintData.blueprintType);
            if (req.body.blueprintData.blueprintType === 'docker') {
                dockerData = {
                    dockerContainerPathsTitle: req.body.blueprintData.dockercontainerpathstitle,
                    dockerContainerPaths: req.body.blueprintData.dockercontainerpaths,
                    dockerLaunchParameters: req.body.blueprintData.dockerlaunchparameters,
                    dockerRepoName: req.body.blueprintData.dockerreponame,
                    dockerCompose: req.body.blueprintData.dockercompose,
                    dockerRepoTags: req.body.blueprintData.dockerrepotags,
                    dockerImageName: req.body.blueprintData.dockerimagename,
                };
                blueprintData.dockerData = dockerData;

            } else if (req.body.blueprintData.blueprintType === 'instance_launch') {
                logger.debug('req.body.blueprintData.blueprintType ==>', req.body.blueprintData.blueprintType);
                instanceData = {
                    keyPairId: req.body.blueprintData.keyPairId,
                    securityGroupIds: req.body.blueprintData.securityGroupIds,
                    instanceType: req.body.blueprintData.instanceType,
                    instanceAmiid: req.body.blueprintData.instanceAmiid,
                    instanceUsername: 'root',
                    vpcId: req.body.blueprintData.vpcId,
                    subnetId: req.body.blueprintData.subnetId,
                    imageId: req.body.blueprintData.imageId,
                    cloudProviderType: 'aws',
                    cloudProviderId: req.body.blueprintData.providerId,
                    infraManagerType: 'chef',
                    infraManagerId: req.body.blueprintData.chefServerId,
                    runlist: req.body.blueprintData.runlist
                }
                blueprintData.instanceData = instanceData;
            } else {
                res.send(400, {
                    message: "Invalid Blueprint Type"
                });
            }


            if (!blueprintData.users || !blueprintData.users.length) {
                res.send(400);
                return;
            }

            Blueprints.createNew(blueprintData, function(err, data) {
                if (err) {
                    logger.error('error occured while saving blueorint', err);
                    res.send(500, {
                        message: "DB error"
                    });
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


        Blueprints.getById(req.params.blueprintId, function(err, blueprint) {
            if (err) {
                logger.error("Failed to get blueprint versions ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            blueprint.update(blueprintUpdateData, function(err, updatedBlueprint) {
                if (err) {
                    logger.error("Failed to update blueprint ", err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                var latestVersionData = updatedBlueprint.getLatestVersion();
                if (latestVersionData) {
                    res.send({
                        version: latestVersionData.ver
                    });
                } else {
                    res.send(200);
                }


            });
        });

    }); // end app.post('/blueprints/:blueprintId/update' )

    app.get('/blueprints/:blueprintId/versions/:version', function(req, res) {
        logger.debug("Enter /blueprints/%s/versions/%s", req.params.blueprintId, req.params.version);

        Blueprints.getById(req.params.blueprintId, function(err, blueprint) {
            if (err) {
                logger.error("Failed to get blueprint versions ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            logger.debug(blueprint);

            var versionData = blueprint.getVersionData(req.params.version);
            res.send(200, versionData);

        });

    });

    app.delete('/blueprints/:blueprintId', function(req, res) {
        logger.debug("Enter /blueprints/delete/%s", req.params.blueprintId);
        Blueprints.removeById(req.params.blueprintId, function(err, data) {
            if (err) {
                logger.error("Failed to delete blueprint ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            res.send(200, {
                message: "deleted"
            });
        });
    });


    app.get('/blueprints/:blueprintId/launch', function(req, res) {
        logger.debug("Enter /blueprints/%s/launch", req.params.blueprintId);
        //verifying if the user has permission
        logger.debug('Verifying User permission set for execute.');
        if (!req.query.envId) {
            res.send(400, {
                "message": "Invalid Environment Id"
            });
            return;
        }
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
                            configmgmtDao.getEnvNameFromEnvId(req.query.envId, function(err, envName) {
                                if (err) {
                                    res.send(500);
                                    return;
                                }
                                if (!envName) {
                                    res.send(500, {
                                        "message": "Unable to find environment name from environment id"
                                    });
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
                                                var cryptoConfig = appConfig.cryptoSettings;
                                                var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                var keys = [];
                                                keys.push(aProvider.accessKey);
                                                keys.push(aProvider.secretKey);
                                                cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                                    if (err) {
                                                        res.sned(500, "Failed to decrypt accessKey or secretKey");
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
                                                            "access_key": decryptedKeys[0],
                                                            "secret_key": decryptedKeys[1],
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
                                                            if (!blueprint.appUrls) {
                                                                blueprint.appUrls = [];
                                                            }
                                                            var appUrls = blueprint.appUrls;
                                                            if (appConfig.appUrls && appConfig.appUrls.length) {
                                                                appUrls = appUrls.concat(appConfig.appUrls);
                                                            }

                                                            var instance = {
                                                                name: blueprint.name,
                                                                orgId: blueprint.orgId,
                                                                bgId: blueprint.bgId,
                                                                projectId: blueprint.projectId,
                                                                envId: req.query.envId,
                                                                providerId: blueprint.providerId,
                                                                keyPairId: blueprint.keyPairId,
                                                                chefNodeName: instanceData.InstanceId,
                                                                runlist: version.runlist,
                                                                platformId: instanceData.InstanceId,
                                                                appUrls: appUrls,
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
                                                            };

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
                                                                        timestamp: new Date().getTime()
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
                                                                                            log: "Instance Bootstraped successfully",
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
                                                                                            log: "Bootstrap Failed",
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


                                                    chef.getEnvironment(req.query.envId, function(err, env) {
                                                        if (err) {
                                                            logger.error("Failed chef.getEnvironment", err);
                                                            res.send(500);
                                                            return;
                                                        }

                                                        if (!env) {
                                                            logger.debug("Blueprint env ID = ", req.query.envId);
                                                            chef.createEnvironment(req.query.envId, function(err, envName) {
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
                                                }); // decryption
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


};