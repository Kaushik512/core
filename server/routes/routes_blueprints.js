var Blueprints = require('_pr/model/blueprint');

var instancesDao = require('../model/classes/instance/instance');
var EC2 = require('../lib/ec2.js');
var Chef = require('../lib/chef.js');
var logsDao = require('../model/dao/logsdao.js');
var Docker = require('../model/docker.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var usersDao = require('../model/users.js');
var appConfig = require('_pr/config');
var Cryptography = require('../lib/utils/cryptography');
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var logger = require('_pr/logger')(module);
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var currentDirectory = __dirname;
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');

var credentialcryptography = require('../lib/credentialcryptography');

var CloudFormation = require('_pr/model/cloud-formation');

var AWSCloudFormation = require('_pr/lib/awsCloudFormation.js');
var errorResponses = require('./error_responses');
var Openstack = require('_pr/lib/openstack');
var openstackProvider = require('_pr/model/classes/masters/cloudprovider/openstackCloudProvider.js');

var Hppubliccloud = require('_pr/lib/hppubliccloud.js');
var hppubliccloudProvider = require('_pr/model/classes/masters/cloudprovider/hppublicCloudProvider.js');

var AzureCloud = require('_pr/lib/azure.js');
var azureProvider = require('_pr/model/classes/masters/cloudprovider/azureCloudProvider.js');


var VmwareCloud = require('_pr/lib/vmware.js');
var vmwareProvider = require('_pr/model/classes/masters/cloudprovider/vmwareCloudProvider.js');

var AwsAutoScaleInstance = require('_pr/model/aws-auto-scale-instance');


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

            var dockerData, instanceData, cloudFormationData;
            logger.debug('req.body.blueprintData.blueprintType ==>', req.body.blueprintData.blueprintType);

            if (req.body.blueprintData.blueprintType === 'docker') {
                console.log('heree 1');
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
            } else if (req.body.blueprintData.blueprintType === 'aws_cf') {

                cloudFormationData = {
                    cloudProviderId: req.body.blueprintData.cftProviderId,
                    infraManagerType: 'chef',
                    infraManagerId: req.body.blueprintData.chefServerId,
                    runlist: req.body.blueprintData.runlist,
                    stackParameters: req.body.blueprintData.cftStackParameters,
                    //stackName: req.body.blueprintData.stackName,
                    templateFile: req.body.blueprintData.cftTemplateFile,
                    region: req.body.blueprintData.region,
                    //instanceUsername: req.body.blueprintData.cftInstanceUserName
                    instances: req.body.blueprintData.cftInstances
                }
                blueprintData.cloudFormationData = cloudFormationData;
            } else {
                res.send(400, {
                    message: "Invalid Blueprint Type"
                });
                return;
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
        logger.debug("Enter /blueprints/%s/launch -- ", req.params.blueprintId);
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
                    Blueprints.getById(req.params.blueprintId, function(err, blueprint) {
                        if (err) {
                            logger.error('Failed to getBlueprint. Error = ', err);
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                        if (!blueprint) {
                            res.send(404, {
                                message: "Blueprint Does Not Exist"
                            });
                            return;
                        }



                        var infraManager = blueprint.getInfraManagerData();
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
                            configmgmtDao.getChefServerDetails(infraManager.infraManagerId, function(err, chefDetails) {
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
                                var cloudProvider = blueprint.getCloudProviderData();
                                if (blueprint.blueprintType === 'instance_launch') {
                                    var version = blueprint.getVersionData(req.query.version);
                                    if (!version) {
                                        res.send(400, {
                                            message: "No blueprint version available"
                                        });
                                        return;
                                    }
                                    //putting maximum launchRestriction
                                    instancesDao.findByProviderId(cloudProvider.cloudProviderId, function(err, instances) {
                                        if (err) {
                                            logger.error("Unable to fetch instance by providerId ", err);
                                            res.send(500, {
                                                message: "Server Behaved Unexpectedly"
                                            });
                                            return;
                                        }

                                        logger.debug('instance length ==>' + instances.length + " , number Of instance ==> " + cloudProvider.cloudProviderData.instanceCount + ' , max ==> ' + appConfig.maxInstanceCount);
                                        var maxCount = 0;
                                        if (typeof appConfig.maxInstanceCount === 'undefined') {
                                            maxCount = appConfig.maxInstanceCount;
                                        }

                                        if (maxCount !== 0 && instances.length + cloudProvider.cloudProviderData.instanceCount > maxCount) {
                                            res.send(500, {
                                                message: "Instance limit reached"
                                            });
                                            return;
                                        }

                                        VMImage.getImageById(cloudProvider.cloudProviderData.imageId, function(err, anImage) {
                                            if (err) {
                                                logger.error(err);
                                                res.send(500, errorResponses.db.error);
                                                return;
                                            }
                                            logger.debug("Loaded Image -- : >>>>>>>>>>> %s", anImage.providerId);
                                            AWSProvider.getAWSProviderById(anImage.providerId, function(err, aProvider) {
                                                if (err) {
                                                    logger.error(err);
                                                    res.send(500, errorResponses.db.error);
                                                    return;
                                                }





                                                AWSKeyPair.getAWSKeyPairById(cloudProvider.cloudProviderData.keyPairId, function(err, aKeyPair) {
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
                                                            res.send(500, "Failed to decrypt accessKey or secretKey");
                                                            return;
                                                        }

                                                        function launchInstance() {
                                                            logger.debug("Enter launchInstance -- ");
                                                            // New add
                                                            //var encryptedPemFileLocation= currentDirectory + '/../catdata/catalyst/provider-pemfiles/';

                                                            var settings = appConfig;
                                                            //encrypting default pem file
                                                            var cryptoConfig = appConfig.cryptoSettings;
                                                            var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                            var encryptedPemFileLocation = settings.instancePemFilesDir + aKeyPair._id;
                                                            var securityGroupIds = [];
                                                            for (var i = 0; i < cloudProvider.cloudProviderData.securityGroupIds.length; i++) {
                                                                securityGroupIds.push(cloudProvider.cloudProviderData.securityGroupIds[i]);
                                                            }

                                                            logger.debug("encryptFile of %s successful", encryptedPemFileLocation);
                                                            var awsSettings = {
                                                                "access_key": decryptedKeys[0],
                                                                "secret_key": decryptedKeys[1],
                                                                "region": aKeyPair.region,
                                                                "keyPairName": aKeyPair.keyPairName
                                                            };
                                                            var ec2 = new EC2(awsSettings);
                                                            //Used to ensure that there is a default value of "1" in the count.
                                                            if (!cloudProvider.cloudProviderData.instanceCount)
                                                                cloudProvider.cloudProviderData.instanceCount = "1";

                                                            ec2.launchInstance(anImage.imageIdentifier, cloudProvider.cloudProviderData.instanceType, securityGroupIds, cloudProvider.cloudProviderData.subnetId, 'D4D-' + blueprint.name, aKeyPair.keyPairName, cloudProvider.cloudProviderData.instanceCount, function(err, instanceDataAll) {
                                                                if (err) {
                                                                    logger.error("launchInstance Failed >> ", err);
                                                                    res.send(500);
                                                                    return;
                                                                }

                                                                logger.debug("Instance Launched -- . Runlist = ", version.runlist);
                                                                logger.debug("Instance Launched -- . Instance data = ", instanceDataAll);
                                                                logger.debug("UserName:::::::::: ", anImage.userName);
                                                                if (!blueprint.appUrls) {
                                                                    blueprint.appUrls = [];
                                                                }
                                                                var appUrls = blueprint.appUrls;
                                                                if (appConfig.appUrls && appConfig.appUrls.length) {
                                                                    appUrls = appUrls.concat(appConfig.appUrls);
                                                                }
                                                                var newinstanceIDs = [];

                                                                function addinstancewrapper(instanceData, instancesLength) {
                                                                    logger.debug('Entered addinstancewrapper ++++++' + instancesLength);
                                                                    var instance = {
                                                                        name: blueprint.name,
                                                                        orgId: blueprint.orgId,
                                                                        bgId: blueprint.bgId,
                                                                        projectId: blueprint.projectId,
                                                                        envId: req.query.envId,
                                                                        providerId: cloudProvider.cloudProviderId,
                                                                        keyPairId: cloudProvider.cloudProviderData.keyPairId,
                                                                        chefNodeName: instanceData.InstanceId,
                                                                        runlist: version.runlist,
                                                                        platformId: instanceData.InstanceId,
                                                                        appUrls: appUrls,
                                                                        instanceIP: instanceData.PublicIpAddress || instanceData.PrivateIpAddress,
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
                                                                            os: cloudProvider.cloudProviderData.instanceOS
                                                                        },
                                                                        credentials: {
                                                                            username: anImage.userName,
                                                                            pemFileLocation: encryptedPemFileLocation,
                                                                        },
                                                                        chef: {
                                                                            serverId: infraManager.infraManagerId,
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

                                                                        //Returning handle when all instances are created
                                                                        newinstanceIDs.push(instance.id);
                                                                        logger.debug('Lengths ---- ' + newinstanceIDs.length + '  ' + instancesLength);
                                                                        if (newinstanceIDs.length >= instancesLength) {
                                                                            res.send(200, {
                                                                                "id": newinstanceIDs,
                                                                                "message": "instance launch success"
                                                                            });
                                                                        }
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
                                                                            instance.instanceIP = instanceData.PublicIpAddress || instanceData.PrivateIpAddress;
                                                                            instancesDao.updateInstanceIp(instance.id, instance.instanceIP, function(err, updateCount) {
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


                                                                    }); //end of create instance.
                                                                } //end of createinstancewrapper function
                                                                //looping through all instances that are launched.
                                                                for (var ic = 0; ic < instanceDataAll.length; ic++) {
                                                                    logger.debug('InstanceDataAll ' + JSON.stringify(instanceDataAll));
                                                                    logger.debug('Length : ' + instanceDataAll.length);
                                                                    addinstancewrapper(instanceDataAll[ic], instanceDataAll.length);
                                                                }


                                                            }); //end of launch

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
                                } else if (blueprint.blueprintType === 'aws_cf') {
                                    var stackName = req.query.stackName;
                                    if (!stackName) {
                                        res.send(400, {
                                            message: "Invalid stack name"
                                        });
                                        return;
                                    }
                                    AWSProvider.getAWSProviderById(blueprint.blueprintConfig.cloudProviderId, function(err, aProvider) {
                                        if (err) {
                                            logger.error("Unable to fetch provide", err);
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
                                                res.send(500, {
                                                    message: "Failed to decrypt accessKey or secretKey"
                                                });
                                                return;
                                            }
                                            // read template file

                                            var templateFile = blueprint.blueprintConfig.templateFile;
                                            var settings = appConfig.chef;
                                            var chefRepoPath = settings.chefReposLocation;
                                            fileIo.readFile(chefRepoPath + 'catalyst_files/' + templateFile, function(err, fileData) {
                                                if (err) {
                                                    logger.error("Unable to read template file " + templateFile, err);
                                                    res.send(500, {
                                                        message: "Unable to read template file"
                                                    });
                                                    return;
                                                }

                                                if (typeof fileData === 'object') {
                                                    fileData = fileData.toString('ascii');
                                                }


                                                function launchCloudFormation() {

                                                    var awsSettings = {
                                                        "access_key": decryptedKeys[0],
                                                        "secret_key": decryptedKeys[1],
                                                        "region": blueprint.blueprintConfig.region,
                                                    };
                                                    var awsCF = new AWSCloudFormation(awsSettings);
                                                    awsCF.createStack({
                                                        name: stackName,
                                                        templateParameters: blueprint.blueprintConfig.stackParameters,
                                                        templateBody: fileData
                                                    }, function(err, stackData) {
                                                        if (err) {
                                                            logger.error("Unable to launch CloudFormation Stack", err);
                                                            res.send(500, {
                                                                message: "Unable to launch CloudFormation Stack"
                                                            });
                                                            return;
                                                        }

                                                        awsCF.getStack(stackData.StackId, function(err, stack) {
                                                            if (err) {
                                                                logger.error("Unable to get stack details", err);
                                                                res.send(500, {
                                                                    "message": "Error occured while fetching stack status"
                                                                });
                                                                return;
                                                            }
                                                            if (stack) {

                                                                // getting autoscale topic arn from templateJSON
                                                                var topicARN = null;
                                                                var autoScaleUsername = null;
                                                                var autoScaleRunlist;
                                                                var templateObj = JSON.parse(fileData);
                                                                var templateResources = templateObj.Resources;
                                                                var templateResourcesKeys = Object.keys(templateResources);
                                                                for (var j = 0; j < templateResourcesKeys.length; j++) {
                                                                    var resource = templateResources[templateResourcesKeys[j]];

                                                                    if (resource && resource.Type === 'AWS::AutoScaling::AutoScalingGroup') {
                                                                        var autoScaleProperties = resource.Properties;
                                                                        if (autoScaleProperties && autoScaleProperties.NotificationConfigurations && autoScaleProperties.NotificationConfigurations.length) {
                                                                            for (var i = 0; i < autoScaleProperties.NotificationConfigurations.length; i++) {
                                                                                if (autoScaleProperties.NotificationConfigurations[i].TopicARN) {
                                                                                    topicARN = autoScaleProperties.NotificationConfigurations[i].TopicARN;
                                                                                    // getting auto scale instance username
                                                                                    for (var count = 0; count < blueprint.blueprintConfig.instances.length; count++) {
                                                                                        if ('AutoScaleInstanceResource' === blueprint.blueprintConfig.instances[count].logicalId) {
                                                                                            autoScaleUsername = blueprint.blueprintConfig.instances[count].username;
                                                                                            autoScaleRunlist = blueprint.blueprintConfig.instances[count].runlist;
                                                                                            break;
                                                                                        }
                                                                                    }

                                                                                    break;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }


                                                                CloudFormation.createNew({
                                                                    orgId: blueprint.orgId,
                                                                    bgId: blueprint.bgId,
                                                                    projectId: blueprint.projectId,
                                                                    envId: req.query.envId,
                                                                    stackParameters: blueprint.blueprintConfig.stackParameters,
                                                                    templateFile: blueprint.blueprintConfig.templateFile,
                                                                    cloudProviderId: blueprint.blueprintConfig.cloudProviderId,
                                                                    infraManagerId: infraManager.infraManagerId,
                                                                    //runlist: version.runlist,
                                                                    infraManagerType: 'chef',
                                                                    stackName: stackName,
                                                                    stackId: stackData.StackId,
                                                                    status: stack.StackStatus,
                                                                    users: blueprint.users,
                                                                    region: blueprint.blueprintConfig.region,
                                                                    instanceUsername: blueprint.blueprintConfig.instanceUsername,
                                                                    autoScaleTopicArn: topicARN,
                                                                    autoScaleUsername: autoScaleUsername,
                                                                    autoScaleRunlist: autoScaleRunlist


                                                                }, function(err, cloudFormation) {
                                                                    if (err) {
                                                                        logger.error("Unable to save CloudFormation data in DB", err);
                                                                        res.send(500, errorResponses.db.error);
                                                                        return;
                                                                    }
                                                                    res.send(200, {
                                                                        stackId: cloudFormation._id
                                                                    });

                                                                    awsCF.waitForStackCompleteStatus(stackData.StackId, function(err, completeStack) {
                                                                        if (err) {
                                                                            logger.error('Unable to wait for stack status', err);
                                                                            if (err.stackStatus) {
                                                                                cloudFormation.status = err.stackStatus;
                                                                                cloudFormation.save();
                                                                            }
                                                                            return;
                                                                        }
                                                                        cloudFormation.status = completeStack.StackStatus;
                                                                        cloudFormation.save();

                                                                        awsCF.listAllStackResources(stackData.StackId, function(err, resources) {
                                                                            if (err) {
                                                                                logger.error('Unable to fetch stack resources', err);
                                                                                return;
                                                                            }
                                                                            var keyPairName;
                                                                            var parameters = cloudFormation.stackParameters;
                                                                            for (var i = 0; i < parameters.length; i++) {
                                                                                if (parameters[i].ParameterKey === 'KeyName') {
                                                                                    keyPairName = parameters[i].ParameterValue;
                                                                                    break;
                                                                                }
                                                                            }

                                                                            console.log('resources === >', resources);


                                                                            var ec2 = new EC2(awsSettings);
                                                                            var ec2Resources = {};
                                                                            var autoScaleResourceIds = [];
                                                                            var autoScaleResourceId = 'temp-Id';
                                                                            for (var i = 0; i < resources.length; i++) {
                                                                                if (resources[i].ResourceType === 'AWS::EC2::Instance') {
                                                                                    //instanceIds.push(resources[i].PhysicalResourceId);
                                                                                    ec2Resources[resources[i].PhysicalResourceId] = resources[i].LogicalResourceId;
                                                                                } else if (resources[i].ResourceType === 'AWS::AutoScaling::AutoScalingGroup') {
                                                                                    autoScaleResourceId = resources[i].PhysicalResourceId;
                                                                                    autoScaleResourceIds.push(resources[i].PhysicalResourceId);
                                                                                }
                                                                            }
                                                                            if (autoScaleResourceIds.length) {
                                                                                cloudFormation.autoScaleResourceIds = autoScaleResourceIds;
                                                                                cloudFormation.save();
                                                                            }

                                                                            // fetching autoscale resouce if any 
                                                                            AwsAutoScaleInstance.findByAutoScaleResourceId(autoScaleResourceId, function(err, autoScaleInstances) {
                                                                                if (err) {
                                                                                    logger.error('Unable to fetch autoscale instance resources', err);
                                                                                    return;
                                                                                }
                                                                                for (var i = 0; i < autoScaleInstances.length; i++) {
                                                                                    //instanceIds.push(autoScaleInstances[0].awsInstanceId);
                                                                                    ec2Resources[autoScaleInstances[i].awsInstanceId] = 'autoScaleAwsInstance';
                                                                                }
                                                                                var instanceIds = Object.keys(ec2Resources);
                                                                                console.log("instanceIDS length ==>", instanceIds.length);
                                                                                if (instanceIds.length) {
                                                                                    var instances = [];

                                                                                    ec2.describeInstances(instanceIds, function(err, awsRes) {
                                                                                        if (err) {
                                                                                            logger.error("Unable to get instance details from aws", err);
                                                                                            return;
                                                                                        }
                                                                                        if (!(awsRes.Reservations && awsRes.Reservations.length)) {
                                                                                            return;
                                                                                        }
                                                                                        var reservations = awsRes.Reservations;
                                                                                        for (var k = 0; k < reservations.length; k++) {

                                                                                            if (reservations[k].Instances && reservations[k].Instances.length) {
                                                                                                //instances = reservations[k].Instances;
                                                                                                instances = instances.concat(reservations[k].Instances);
                                                                                            }


                                                                                            console.log(awsRes);

                                                                                        }
                                                                                        logger.debug('Instances length ==>', instances.length, instanceIds);
                                                                                        //creating jsonAttributesObj ??? WHY
                                                                                        var jsonAttributesObj = {
                                                                                            instances: {}
                                                                                        };

                                                                                        for (var i = 0; i < instances.length; i++) {
                                                                                            jsonAttributesObj.instances[ec2Resources[instances[i].InstanceId]] = instances[i].PublicIpAddress;
                                                                                        }
                                                                                        for (var i = 0; i < instances.length; i++) {
                                                                                            addAndBootstrapInstance(instances[i], jsonAttributesObj);
                                                                                        }

                                                                                    });

                                                                                    function addAndBootstrapInstance(instanceData, jsonAttributesObj) {

                                                                                        var keyPairName = instanceData.KeyName;
                                                                                        AWSKeyPair.getAWSKeyPairByProviderIdAndKeyPairName(cloudFormation.cloudProviderId, keyPairName, function(err, keyPairs) {
                                                                                            if (err) {
                                                                                                logger.error("Unable to get keypairs", err);
                                                                                                return;
                                                                                            }
                                                                                            if (keyPairs && keyPairs.length) {
                                                                                                var keyPair = keyPairs[0];
                                                                                                var encryptedPemFileLocation = appConfig.instancePemFilesDir + keyPair._id;

                                                                                                if (!blueprint.appUrls) {
                                                                                                    blueprint.appUrls = [];
                                                                                                }
                                                                                                var appUrls = blueprint.appUrls;
                                                                                                if (appConfig.appUrls && appConfig.appUrls.length) {
                                                                                                    appUrls = appUrls.concat(appConfig.appUrls);
                                                                                                }
                                                                                                var os = instanceData.Platform;
                                                                                                if (os) {
                                                                                                    os = 'windows';
                                                                                                } else {
                                                                                                    os = 'linux';
                                                                                                }


                                                                                                var instanceName;

                                                                                                var runlist = [];
                                                                                                var instanceUsername;
                                                                                                var logicalId = ec2Resources[instanceData.InstanceId];

                                                                                                if (logicalId === 'autoScaleAwsInstance') {
                                                                                                    runlist = cloudFormation.autoScaleRunlist || [];
                                                                                                    instanceUsername = cloudFormation.autoScaleUsername || 'ubuntu';
                                                                                                    instanceName = cloudFormation.stackName + '-AutoScale';
                                                                                                    
                                                                                                } else {
                                                                                                    for (var count = 0; count < blueprint.blueprintConfig.instances.length; count++) {
                                                                                                        if (logicalId === blueprint.blueprintConfig.instances[count].logicalId) {
                                                                                                            instanceUsername = blueprint.blueprintConfig.instances[count].username;
                                                                                                            runlist = blueprint.blueprintConfig.instances[count].runlist;
                                                                                                            break;
                                                                                                        }
                                                                                                    }
                                                                                                    instanceName = blueprint.name;
                                                                                                }

                                                                                                if (instanceData.Tags && instanceData.Tags.length) {
                                                                                                    for (var j = 0; j < instanceData.Tags.length; j++) {
                                                                                                        if (instanceData.Tags[j].Key === 'Name') {
                                                                                                            instanceName = instanceData.Tags[j].Value;
                                                                                                        }

                                                                                                    }
                                                                                                }

                                                                                                if (!instanceUsername) {
                                                                                                    instanceUsername = 'ubuntu'; // hack for default username
                                                                                                }

                                                                                                var instance = {
                                                                                                    name: instanceName,
                                                                                                    orgId: blueprint.orgId,
                                                                                                    bgId: blueprint.bgId,
                                                                                                    projectId: blueprint.projectId,
                                                                                                    envId: req.query.envId,
                                                                                                    providerId: cloudFormation.cloudProviderId,
                                                                                                    keyPairId: keyPair._id,
                                                                                                    chefNodeName: instanceData.InstanceId,
                                                                                                    runlist: runlist,
                                                                                                    platformId: instanceData.InstanceId,
                                                                                                    appUrls: appUrls,
                                                                                                    instanceIP: instanceData.PublicIpAddress || instanceData.PrivateIpAddress,
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
                                                                                                        os: os
                                                                                                    },
                                                                                                    credentials: {
                                                                                                        username: instanceUsername,
                                                                                                        pemFileLocation: encryptedPemFileLocation,
                                                                                                    },
                                                                                                    chef: {
                                                                                                        serverId: infraManager.infraManagerId,
                                                                                                        chefNodeName: instanceData.InstanceId
                                                                                                    },
                                                                                                    blueprintData: {
                                                                                                        blueprintId: blueprint._id,
                                                                                                        blueprintName: blueprint.name,
                                                                                                        templateId: blueprint.templateId,
                                                                                                        templateType: blueprint.templateType,
                                                                                                        templateComponents: blueprint.templateComponents,
                                                                                                        iconPath: blueprint.iconpath
                                                                                                    },
                                                                                                    cloudFormationId: cloudFormation._id
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
                                                                                                        log: "Waiting for instance ok state",
                                                                                                        timestamp: timestampStarted
                                                                                                    });
                                                                                                    ec2.waitForEvent(instanceData.InstanceId, 'instanceStatusOk', function(err) {
                                                                                                        if (err) {
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
                                                                                                            return;
                                                                                                        }

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
                                                                                                                instanceOS: instance.hardware.os,
                                                                                                                jsonAttributes: jsonAttributesObj
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
                                                                                            }
                                                                                        });


                                                                                    }

                                                                                }
                                                                            });

                                                                        });

                                                                    });

                                                                });

                                                            } else {
                                                                res.send(500, {
                                                                    "message": "Error occured while fetching stack status"
                                                                });
                                                                return;

                                                            }

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
                                                            launchCloudFormation();

                                                        });
                                                    } else {
                                                        launchCloudFormation();
                                                    }

                                                });

                                            });
                                        });



                                    });
                                } else if (blueprint.blueprintType === 'openstack_launch') {
                                    logger.debug(blueprint);
                                    logger.debug(req.query.version);
                                    var version = blueprint.getVersionData(req.query.version);
                                    if (!version) {
                                        res.send(400, {
                                            message: "No blueprint version available"
                                        });
                                        return;
                                    } else {
                                        logger.debug('Runlist version:');
                                        logger.debug(JSON.stringify(version.runlist));
                                    }
                                    openstackProvider.getopenstackProviderById(blueprint.blueprintConfig.cloudProviderId, function(err, providerdata) {
                                        if (err) {
                                            logger.error('getopenstackProviderById ' + err);
                                            return;
                                        }
                                        logger.debug(providerdata);
                                        var launchOpenstackBP = function(providerdata, blueprint) {
                                            //var json= "{\"server\": {\"name\": \"server-testa\",\"imageRef\": \"0495d8b6-1746-4e0d-a44e-010e41db0caa\",\"flavorRef\": \"2\",\"max_count\": 1,\"min_count\": 1,\"networks\": [{\"uuid\": \"a3bf46aa-20fa-477e-a2e5-e3d3a3ea1122\"}],\"security_groups\": [{\"name\": \"default\"}]}}";
                                            var launchparams = {
                                                server: {
                                                    name: "D4D-" + blueprint.name,
                                                    imageRef: blueprint.blueprintConfig.instanceImageName,
                                                    flavorRef: blueprint.blueprintConfig.flavor,
                                                    key_name: 'key',
                                                    max_count: 1,
                                                    min_count: 1,
                                                    networks: [{
                                                        uuid: blueprint.blueprintConfig.network
                                                    }],
                                                    security_groups: [{
                                                        name: 'default'
                                                    }]

                                                }
                                            }
                                            var openstackconfig = {
                                                host: providerdata.host,
                                                username: providerdata.username,
                                                password: providerdata.password,
                                                tenantName: providerdata.tenantname,
                                                tenantId: providerdata.tenantid,
                                                serviceendpoints: providerdata.serviceendpoints
                                            };
                                            var openstack = new Openstack(openstackconfig);
                                            openstack.createServer(openstackconfig.tenantId, launchparams, function(err, instanceData) {
                                                if (err) {
                                                    logger.error('openstack createServer error', err);
                                                    res.send(500, err);
                                                    return;
                                                }
                                                logger.debug('OS Launched');
                                                logger.debug(JSON.stringify(instanceData));
                                                //Creating instance in catalyst
                                                var instance = {
                                                    name: launchparams.server.name,
                                                    orgId: blueprint.orgId,
                                                    bgId: blueprint.bgId,
                                                    projectId: blueprint.projectId,
                                                    envId: req.query.envId,
                                                    providerId: blueprint.blueprintConfig.cloudProviderId,
                                                    keyPairId: 'unknown',
                                                    chefNodeName: instanceData.server.id,
                                                    runlist: version.runlist,
                                                    platformId: instanceData.server.id,
                                                    appUrls: blueprint.appUrls,
                                                    instanceIP: 'unknown',
                                                    instanceState: 'unknown',
                                                    bootStrapStatus: 'waiting',
                                                    users: blueprint.users,
                                                    hardware: {
                                                        platform: 'openstack',
                                                        platformVersion: 'unknown',
                                                        architecture: 'unknown',
                                                        memory: {
                                                            total: 'unknown',
                                                            free: 'unknown',
                                                        },
                                                        os: blueprint.blueprintConfig.instanceOS
                                                    },
                                                    credentials: {
                                                        username: 'ubuntu',
                                                        pemFileLocation: appConfig.catalystDataDir + '/' + appConfig.catalysHomeDirName + '/' + appConfig.instancePemFilesDirName + '/' + blueprint.blueprintConfig.cloudProviderId
                                                    },
                                                    chef: {
                                                        serverId: blueprint.blueprintConfig.infraManagerId,
                                                        chefNodeName: instanceData.id
                                                    },
                                                    blueprintData: {
                                                        blueprintId: blueprint._id,
                                                        blueprintName: blueprint.name,
                                                        templateId: blueprint.templateId,
                                                        templateType: blueprint.templateType,
                                                        iconPath: blueprint.iconpath
                                                    }

                                                };

                                                logger.debug('Instance Data');
                                                logger.debug(JSON.stringify(instance));
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
                                                        log: "Waiting for instance ok state",
                                                        timestamp: timestampStarted
                                                    });
                                                    //var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, req.session.user.cn, timestampStarted);
                                                    //var logsReferenceIds = [instance.id, actionLog._id];
                                                    //logsDao.insertLog({
                                                    //    referenceId: logsReferenceIds,
                                                    //    err: false,
                                                    //    log: "Waiting for instance ok state",
                                                    //     timestamp: timestampStarted
                                                    //  });

                                                    logger.debug('Returned from Create Instance. About to wait for instance ready state');


                                                    //waiting for server to become active
                                                    logger.debug('Returned from Create Instance. About to send response');
                                                    //res.send(200);
                                                    res.send(200, {
                                                        "id": [instance.id],
                                                        "message": "instance launch success"
                                                    });
                                                    logger.debug('Should have sent the response & Entering wait state for instance ready:',JSON.stringify(instanceData));
                                                    var cryptoConfig = appConfig.cryptoSettings;
                                                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                    //decrypting and including key in instancedata


                                                    var tempUncryptedPemFileLoc = appConfig.tempDir + '/' + uuid.v4();
                                                    logger.debug('instance.credentials.pemFileLocation:', instance.credentials.pemFileLocation);
                                                    cryptography.decryptFile(instance.credentials.pemFileLocation, cryptoConfig.decryptionEncoding, tempUncryptedPemFileLoc, cryptoConfig.encryptionEncoding, function(err) {

                                                        instanceData.credentials = {
                                                            "username": "ubuntu", //to be fetched from vm images, based on the image.
                                                            "pemFilePath": tempUncryptedPemFileLoc
                                                        }

                                                        openstack.waitforserverready(openstackconfig.tenantId, instanceData, function(err, data) {
                                                            if (!err) {
                                                                logger.debug('Instance Ready....');
                                                                logger.debug(JSON.stringify(data)); // logger.debug(data);
                                                                logger.debug('About to bootstrap Instance');
                                                                //identifying pulic ip
                                                                var publicip = '';
                                                                if (data.floatingipdata) {
                                                                    publicip = data.floatingipdata.floatingip.floating_ip_address;
                                                                   
                                                                } else {
                                                                  //to be handled if floating ip is not received.
                                                                   logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: false,
                                                                        log: "Instance was not associated with an IP",
                                                                        timestamp: timestampStarted
                                                                    });
                                                                }
                                                                instancesDao.updateInstanceIp(instance.id, publicip, function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("instancesDao.updateInstanceIp Failed ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('Instance ip Updated');
                                                                });
                                                                instancesDao.updateInstanceState(instance.id, "running", function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("instancesDao.updateInstanceState Failed ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('Instance state Updated');
                                                                });

                                                                logsDao.insertLog({
                                                                    referenceId: logsReferenceIds,
                                                                    err: false,
                                                                    log: "Instance Ready..about to bootstrap",
                                                                    timestamp: timestampStarted
                                                                });
                                                                chef.bootstrapInstance({
                                                                    instanceIp: publicip,
                                                                    runlist: version.runlist,
                                                                    instanceUsername: 'ubuntu',
                                                                    pemFilePath: tempUncryptedPemFileLoc,
                                                                    nodeName: launchparams.server.name,
                                                                    environment: envName,
                                                                    instanceOS: instance.hardware.os,
                                                                    jsonAttributes: null
                                                                }, function(err, code) {
                                                                    if (code == 0) {
                                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                            if (err) {
                                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                            } else {
                                                                                logger.debug("Instance bootstrap status set to success");
                                                                            }
                                                                        });
                                                                    }
                                                                }, function(stdOutData) {

                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: false,
                                                                        log: stdOutData.toString('ascii'),
                                                                        timestamp: new Date().getTime()
                                                                    });
                                                                    if (stdOutData.toString('ascii').indexOf("Chef Client finished") > 0) {
                                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                            if (err) {
                                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                            } else {
                                                                                logger.debug("Instance bootstrap status set to success");
                                                                                logsDao.insertLog({
                                                                                    referenceId: logsReferenceIds,
                                                                                    err: false,
                                                                                    log: "Instance Bootstraped successfully",
                                                                                    timestamp: new Date().getTime()
                                                                                });
                                                                            }
                                                                        });
                                                                    }

                                                                }, function(stdErrData) {

                                                                    //retrying 4 times before giving up.
                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: true,
                                                                        log: stdErrData.toString('ascii'),
                                                                        timestamp: new Date().getTime()
                                                                    });

                                                                });
                                                            } else {
                                                                logger.debug('Err Creating Instance:' + err);
                                                                return;
                                                            }
                                                        });
                                                    });

                                                });


                                                //res.send(data);
                                            });
                                        }
                                        launchOpenstackBP(providerdata, blueprint);

                                    });

                                } else if (blueprint.blueprintType === 'hppubliccloud_launch') {
                                    logger.debug(blueprint);
                                    logger.debug(req.query.version);
                                    var version = blueprint.getVersionData(req.query.version);
                                    if (!version) {
                                        res.send(400, {
                                            message: "No blueprint version available"
                                        });
                                        return;
                                    } else {
                                        logger.debug('Runlist version:');
                                        logger.debug(JSON.stringify(version.runlist));
                                    }
                                    hppubliccloudProvider.gethppubliccloudProviderById(blueprint.blueprintConfig.cloudProviderId, function(err, providerdata) {
                                        if (err) {
                                            logger.error('gethppubliccloudProviderById ' + err);
                                            return;
                                        }
                                        logger.debug(providerdata);
                                        var launchHPpubliccloudBP = function(providerdata, blueprint) {
                                            //var json= "{\"server\": {\"name\": \"server-testa\",\"imageRef\": \"0495d8b6-1746-4e0d-a44e-010e41db0caa\",\"flavorRef\": \"2\",\"max_count\": 1,\"min_count\": 1,\"networks\": [{\"uuid\": \"a3bf46aa-20fa-477e-a2e5-e3d3a3ea1122\"}],\"security_groups\": [{\"name\": \"default\"}]}}";
                                            var launchparams = {
                                                server: {
                                                    name: "D4D-" + blueprint.name,
                                                    imageRef: blueprint.blueprintConfig.instanceImageName,
                                                    flavorRef: blueprint.blueprintConfig.flavor,
                                                    key_name: providerdata.keyname,
                                                    max_count: 1,
                                                    min_count: 1,
                                                    networks: [{
                                                        uuid: blueprint.blueprintConfig.network
                                                    }],
                                                    security_groups: [{
                                                        name: 'default'
                                                    }]

                                                }
                                            }
                                            var hppubliccloudconfig = {
                                                host: providerdata.host,
                                                username: providerdata.username,
                                                password: providerdata.password,
                                                tenantName: providerdata.tenantname,
                                                tenantId: providerdata.tenantid,
                                                serviceendpoints: providerdata.serviceendpoints

                                            };
                                            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);
                                            hppubliccloud.createServer(hppubliccloudconfig.tenantId, launchparams, function(err, instanceData) {
                                                if (err) {
                                                    logger.error('hppubliccloud createServer error', err);
                                                    res.send(500, err);
                                                    return;
                                                }
                                                logger.debug('OS Launched');
                                                logger.debug(JSON.stringify(instanceData));
                                                //Creating instance in catalyst
                                                var instance = {
                                                    name: launchparams.server.name,
                                                    orgId: blueprint.orgId,
                                                    bgId: blueprint.bgId,
                                                    projectId: blueprint.projectId,
                                                    envId: req.query.envId,
                                                    providerId: blueprint.blueprintConfig.cloudProviderId,
                                                    keyPairId: 'unknown',
                                                    chefNodeName: instanceData.server.id,
                                                    runlist: version.runlist,
                                                    platformId: instanceData.server.id,
                                                    appUrls: blueprint.appUrls,
                                                    instanceIP: 'unknown',
                                                    instanceState: 'unknown',
                                                    bootStrapStatus: 'waiting',
                                                    users: blueprint.users,
                                                    hardware: {
                                                        platform: 'hppubliccloud',
                                                        platformVersion: 'unknown',
                                                        architecture: 'unknown',
                                                        memory: {
                                                            total: 'unknown',
                                                            free: 'unknown',
                                                        },
                                                        os: blueprint.blueprintConfig.instanceOS
                                                    },
                                                    credentials: {
                                                        username: 'ubuntu',
                                                        pemFileLocation: appConfig.catalystDataDir + '/' + appConfig.catalysHomeDirName + '/' + appConfig.instancePemFilesDirName + '/' + blueprint.blueprintConfig.cloudProviderId
                                                    },
                                                    chef: {
                                                        serverId: blueprint.blueprintConfig.infraManagerId,
                                                        chefNodeName: instanceData.id
                                                    },
                                                    blueprintData: {
                                                        blueprintId: blueprint._id,
                                                        blueprintName: blueprint.name,
                                                        templateId: blueprint.templateId,
                                                        templateType: blueprint.templateType,
                                                        iconPath: blueprint.iconpath
                                                    }

                                                };

                                                logger.debug('Instance Data');
                                                logger.debug(JSON.stringify(instance));
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
                                                        log: "Waiting for instance ok state",
                                                        timestamp: timestampStarted
                                                    });
                                                    //var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, req.session.user.cn, timestampStarted);
                                                    //var logsReferenceIds = [instance.id, actionLog._id];
                                                    //logsDao.insertLog({
                                                    //    referenceId: logsReferenceIds,
                                                    //    err: false,
                                                    //    log: "Waiting for instance ok state",
                                                    //     timestamp: timestampStarted
                                                    //  });

                                                    logger.debug('Returned from Create Instance. About to wait for instance ready state');


                                                    //waiting for server to become active
                                                    logger.debug('Returned from Create Instance. About to send response');
                                                    //res.send(200);
                                                    res.send(200, {
                                                        "id": [instance.id],
                                                        "message": "instance launch success"
                                                    });
                                                    logger.debug('Should have sent the response.');
                                                    var cryptoConfig = appConfig.cryptoSettings;
                                                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                    //decrypting and including key in instancedata


                                                    var tempUncryptedPemFileLoc = appConfig.tempDir + '/' + uuid.v4();

                                                    //instance.credentials.pemFileLocation =   appConfig.catalystDataDir + '/' + appConfig.catalysHomeDirName + '/' +  appConfig.instancePemFilesDirName + '/' + blueprint.blueprintConfig.cloudProviderId;
                                                    logger.debug('instance.credentials.pemFileLocation:', instance.credentials.pemFileLocation);
                                                    cryptography.decryptFile(instance.credentials.pemFileLocation, cryptoConfig.decryptionEncoding, tempUncryptedPemFileLoc, cryptoConfig.encryptionEncoding, function(err) {

                                                        instanceData.credentials = {
                                                            "username": "ubuntu", //to be fetched from vm images, based on the image.
                                                            "pemFilePath": tempUncryptedPemFileLoc
                                                        }
                                                        //instanceData.credentials = instance.credentials;
                                                        hppubliccloud.waitforserverready(hppubliccloudconfig.tenantId, instanceData, function(err, data) {
                                                            if (!err) {
                                                                logger.debug('Instance Ready....');
                                                                logger.debug(JSON.stringify(data)); // logger.debug(data);
                                                                logger.debug('About to bootstrap Instance');
                                                                //identifying pulic ip
                                                                var publicip = instanceData.floatingipdata.floatingip.floating_ip_address;

                                                                instancesDao.updateInstanceIp(instance.id, publicip, function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("instancesDao.updateInstanceIp Failed ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('Instance ip Updated');
                                                                });
                                                                instancesDao.updateInstanceState(instance.id, "running", function(err, updateCount) {
                                                                    if (err) {
                                                                        logger.error("instancesDao.updateInstanceState Failed ==>", err);
                                                                        return;
                                                                    }
                                                                    logger.debug('Instance state Updated');
                                                                });

                                                                logsDao.insertLog({
                                                                    referenceId: logsReferenceIds,
                                                                    err: false,
                                                                    log: "Instance Ready..about to bootstrap",
                                                                    timestamp: timestampStarted
                                                                });
                                                                chef.bootstrapInstance({
                                                                    instanceIp: publicip,
                                                                    runlist: version.runlist,
                                                                    instanceUsername: instanceData.credentials.username,
                                                                    pemFilePath: tempUncryptedPemFileLoc,
                                                                    nodeName: launchparams.server.name,
                                                                    environment: envName,
                                                                    instanceOS: instance.hardware.os,
                                                                    jsonAttributes: null
                                                                }, function(err, code) {
                                                                    if (code == 0) {
                                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                            if (err) {
                                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                            } else {
                                                                                logger.debug("Instance bootstrap status set to success");
                                                                            }
                                                                        });
                                                                    }
                                                                }, function(stdOutData) {

                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: false,
                                                                        log: stdOutData.toString('ascii'),
                                                                        timestamp: new Date().getTime()
                                                                    });
                                                                    if (stdOutData.toString('ascii').indexOf("Chef Client finished") > 0) {
                                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                            if (err) {
                                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                            } else {
                                                                                logsDao.insertLog({
                                                                                    referenceId: logsReferenceIds,
                                                                                    err: false,
                                                                                    log: 'Instance Bootstraped Successfully',
                                                                                    timestamp: new Date().getTime()
                                                                                });
                                                                                logger.debug("Instance bootstrap status set to success");
                                                                            }
                                                                        });
                                                                    }

                                                                }, function(stdErrData) {

                                                                    //retrying 4 times before giving up.
                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: true,
                                                                        log: stdErrData.toString('ascii'),
                                                                        timestamp: new Date().getTime()
                                                                    });

                                                                });
                                                            } else {
                                                                logger.debug('Err Creating Instance:' + err);
                                                                return;
                                                            }
                                                        });
                                                    });
                                                });


                                                //res.send(data);
                                            });
                                        }
                                        launchHPpubliccloudBP(providerdata, blueprint);

                                    });

                                } else if (blueprint.blueprintType === 'azure_launch') {
                                    logger.debug("In Azure blueprint launch");
                                    logger.debug(blueprint);
                                    logger.debug(req.query.version);
                                    var version = blueprint.getVersionData(req.query.version);
                                    if (!version) {
                                        res.send(400, {
                                            message: "No blueprint version available"
                                        });
                                        return;
                                    } else {
                                        logger.debug('Runlist version:');
                                        logger.debug(JSON.stringify(version.runlist));
                                    }
                                    azureProvider.getAzureCloudProviderById(blueprint.blueprintConfig.cloudProviderId, function(err, providerdata) {
                                        if (err) {
                                            logger.error('getAzureCloudProviderById ' + err);
                                            return;
                                        }
                                        logger.debug("Azure Provider Data:", providerdata);

                                        var launchAzureCloudBP = function(providerdata, blueprint) {
                                            //{VMName: "D4D-test1", imageName: "b4590d9e3ed742e4a1d46e5424aa335e__suse-sles-12-v20150213", userName: "admin", password: "Pass@1234", size: "ExtraSmall", sshPort: "22", location: "Southeast Asia", vnet: "RelVN", subnet: "StaticSubnet"};  

                                            // security_groups: blueprint.blueprintConfig.cloudProviderData.securityGroupIds

                                            logger.debug("Image Id:", blueprint.blueprintConfig.imageId);

                                            VMImage.getImageById(blueprint.blueprintConfig.imageId, function(err, anImage) {

                                                if (err) {
                                                    logger.error(err);
                                                    res.send(500, errorResponses.db.error);
                                                    return;
                                                }

                                                logger.debug("Loaded Image -- : >>>>>>>>>>> %s", anImage);

                                                var launchparams = {

                                                    VMName: "D4D-" + uuid.v4().split('-')[0],
                                                    imageName: blueprint.blueprintConfig.instanceAmiid,
                                                    size: blueprint.blueprintConfig.instanceType,
                                                    vnet: blueprint.blueprintConfig.vpcId,
                                                    location: blueprint.blueprintConfig.region,
                                                    subnet: blueprint.blueprintConfig.subnetId,
                                                    username: anImage.userName,
                                                    password: anImage.instancePassword,
                                                    sshPort: "22",
                                                    endpoints: blueprint.blueprintConfig.securityGroupIds

                                                }

                                                logger.debug("Azure VM launch params:" + launchparams);

                                                var azureCloud = new AzureCloud();


                                                azureCloud.createServer(launchparams, function(err, instanceData) {
                                                    if (err) {
                                                        logger.error('azure createServer error', err);
                                                        res.send(500, err);
                                                        return;
                                                    }

                                                    var credentials = {
                                                        username: launchparams.username,
                                                        password: launchparams.password
                                                    };

                                                    credentialcryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                                                        if (err) {
                                                            logger.error('azure encryptCredential error', err);
                                                            res.send(500, err);
                                                            return;
                                                        }
                                                        logger.debug('Credentials encrypted..');
                                                        logger.debug('OS Launched');
                                                        logger.debug(JSON.stringify(instanceData));
                                                        //Creating instance in catalyst

                                                        var instance = {
                                                            name: launchparams.VMName,
                                                            orgId: blueprint.orgId,
                                                            bgId: blueprint.bgId,
                                                            projectId: blueprint.projectId,
                                                            envId: req.query.envId,
                                                            providerId: blueprint.blueprintConfig.cloudProviderId,
                                                            keyPairId: 'unknown',
                                                            chefNodeName: launchparams.VMName,
                                                            runlist: version.runlist,
                                                            platformId: launchparams.VMName,
                                                            appUrls: blueprint.appUrls,
                                                            instanceIP: 'unknown',
                                                            instanceState: 'unknown',
                                                            bootStrapStatus: 'waiting',
                                                            users: blueprint.users,
                                                            hardware: {
                                                                platform: 'azure',
                                                                platformVersion: 'unknown',
                                                                architecture: 'unknown',
                                                                memory: {
                                                                    total: 'unknown',
                                                                    free: 'unknown',
                                                                },
                                                                os: blueprint.blueprintConfig.instanceOS
                                                            },
                                                            credentials: {
                                                                username: encryptedCredentials.username,
                                                                password: encryptedCredentials.password
                                                            },
                                                            chef: {
                                                                serverId: blueprint.blueprintConfig.infraManagerId,
                                                                chefNodeName: launchparams.VMName
                                                            },
                                                            blueprintData: {
                                                                blueprintId: blueprint._id,
                                                                blueprintName: blueprint.name,
                                                                templateId: blueprint.templateId,
                                                                templateType: blueprint.templateType,
                                                                iconPath: blueprint.iconpath
                                                            }

                                                        };

                                                        logger.debug('Instance Data');
                                                        logger.debug(JSON.stringify(instance));

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
                                                                log: "Waiting for instance ok state",
                                                                timestamp: timestampStarted
                                                            });
                                                            //var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, req.session.user.cn, timestampStarted);
                                                            //var logsReferenceIds = [instance.id, actionLog._id];
                                                            //logsDao.insertLog({
                                                            //    referenceId: logsReferenceIds,
                                                            //    err: false,
                                                            //    log: "Waiting for instance ok state",
                                                            //     timestamp: timestampStarted
                                                            //  });

                                                            logger.debug('Returned from Create Instance. About to wait for instance ready state');


                                                            //waiting for server to become active
                                                            logger.debug('Returned from Create Instance. About to send response');
                                                            //res.send(200);
                                                            res.send(200, {
                                                                "id": [instance.id],
                                                                "message": "instance launch success"
                                                            });
                                                            logger.debug('Should have sent the response.');


                                                            azureCloud.waitforserverready(instance.name, launchparams.username, launchparams.password, function(err, publicip) {

                                                                if (!err) {
                                                                    logger.debug('Instance Ready....');
                                                                    logger.debug(JSON.stringify(data)); // logger.debug(data);
                                                                    logger.debug('About to bootstrap Instance');
                                                                    //identifying pulic ip
                                                                    //var publicip = '';
                                                                    /* if (data.server.addresses.public) {
                                                                for (var i = 0; i < data.server.addresses.public.length; i++) {
                                                                    if (data.server.addresses.public[i]["version"] == '4') {
                                                                        publicip = data.server.addresses.public[i].addr;
                                                                    }
                                                                }
                                                            } else {
                                                                if (data.server.addresses.private) {
                                                                    for (var i = 0; i < data.server.addresses.private.length; i++) {
                                                                        if (data.server.addresses.private[i]["version"] == '4') {
                                                                            publicip = data.server.addresses.private[i].addr;
                                                                        }
                                                                    }
                                                                } else {
                                                                    logger.error("No IP found", err);
                                                                    res.send(500);
                                                                    return;
                                                                }
                                                            }*/

                                                                    instancesDao.updateInstanceIp(instance.id, publicip, function(err, updateCount) {
                                                                        if (err) {
                                                                            logger.error("instancesDao.updateInstanceIp Failed ==>", err);
                                                                            return;
                                                                        }
                                                                        logger.debug('Instance ip Updated');
                                                                    });
                                                                    instancesDao.updateInstanceState(instance.id, "running", function(err, updateCount) {
                                                                        if (err) {
                                                                            logger.error("instancesDao.updateInstanceState Failed ==>", err);
                                                                            return;
                                                                        }
                                                                        logger.debug('Instance state Updated');
                                                                    });

                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: false,
                                                                        log: "Instance Ready..about to bootstrap",
                                                                        timestamp: timestampStarted
                                                                    });
                                                                    var port='';

                                                                    if(instance.hardware.os === 'windows'){
                                                                        port = '5985';
                                                                    } else {
                                                                        port = '22';
                                                                    }

                                                                    chef.bootstrapInstance({
                                                                        instanceIp: publicip,
                                                                        runlist: version.runlist,
                                                                        instanceUsername: launchparams.username,
                                                                        instancePassword: launchparams.password, //should be the encryped file 
                                                                        nodeName: launchparams.VMName,
                                                                        environment: envName,
                                                                        instanceOS: instance.hardware.os,
                                                                        jsonAttributes: null,
                                                                        port: port
                                                                    }, function(err, code) {
                                                                        if (code == 0) {
                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                if (err) {
                                                                                    logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                                } else {
                                                                                    logger.debug("Instance bootstrap status set to success");
                                                                                }
                                                                            });
                                                                        }
                                                                    }, function(stdOutData) {

                                                                        logsDao.insertLog({
                                                                            referenceId: logsReferenceIds,
                                                                            err: false,
                                                                            log: stdOutData.toString('ascii'),
                                                                            timestamp: new Date().getTime()
                                                                        });
                                                                        if (stdOutData.toString('ascii').indexOf("Chef Client finished") > 0) {
                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                if (err) {
                                                                                    logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                                } else {
                                                                                    logsDao.insertLog({
                                                                                    referenceId: logsReferenceIds,
                                                                                    err: false,
                                                                                    log: 'Instance Bootstraped Successfully',
                                                                                    timestamp: new Date().getTime()
                                                                                });
                                                                                 
                                                                                 logger.debug("Instance bootstrap status set to success");

                                                                                }
                                                                            });
                                                                        }

                                                                    }, function(stdErrData) {

                                                                        //retrying 4 times before giving up.
                                                                        logsDao.insertLog({
                                                                            referenceId: logsReferenceIds,
                                                                            err: true,
                                                                            log: stdErrData.toString('ascii'),
                                                                            timestamp: new Date().getTime()
                                                                        });

                                                                    });
                                                                } else {
                                                                    logger.debug('Err Creating Instance:' + err);
                                                                    return;
                                                                }
                                                            });


                                                            //}); //close of endpoint creation

                                                        }); //close of createInstance
                                                        //res.send(data);
                                                    });
                                                }); //close createServer
                                            }) //close of VMImage getImageById
                                        }

                                        launchAzureCloudBP(providerdata, blueprint);

                                    });

                                } else if (blueprint.blueprintType === 'vmware_launch') {
                                    logger.debug("In Vmware blueprint launch");
                                    logger.debug(blueprint);
                                    logger.debug(req.query.version);
                                    var version = blueprint.getVersionData(req.query.version);
                                    if (!version) {
                                        res.send(400, {
                                            message: "No blueprint version available"
                                        });
                                        return;
                                    } else {
                                        logger.debug('Runlist version:');
                                        logger.debug(JSON.stringify(version.runlist));
                                    }
                                    
                                    vmwareProvider.getvmwareProviderById(blueprint.blueprintConfig.cloudProviderId, function(err, providerdata) {
                                        if (err) {
                                            logger.error('getAzureCloudProviderById ' + err);
                                            return;
                                        }
                                        else{
                                            logger.debug('***********************Blueprint Launch of VMWARE *******************');
                                            
                                            var launchvmwareBP = function(providerdata, blueprint) {
                                                VMImage.getImageById(blueprint.blueprintConfig.imageId, function(err, anImage) {
                                                    if(!err){
                                                           logger.debug(JSON.stringify(anImage)); 
                                                           logger.debug('providerdata',JSON.stringify(providerdata));
                                                           // var serverjson = {"vm_name" : \""D4D-" + blueprint.name + "\"",
                                                           //  "ds" : "\"" + blueprint.blueprintConfig.dataStore + "\"",
                                                           //  "no_of_vm" : blueprint.blueprintConfig.instanceCount
                                                           //  }
                                                           var serverjson = {};
                                                           serverjson["vm_name"] = "D4D-" + blueprint.name;
                                                           serverjson["ds"] = blueprint.blueprintConfig.dataStore;
                                                           serverjson["no_of_vm"] =  blueprint.blueprintConfig.instanceCount;
                                                           
                                                           var vmwareCloud = new VmwareCloud(providerdata);


                                                           vmwareCloud.createServer(appConfig.vmware.serviceHost,anImage.imageIdentifier,serverjson,function(err,createserverdata){
                                                                if(!err){
                                                                    //send the response back and create the instance 
                                                                    var credentials = {
                                                                        username: anImage.userName,
                                                                        password: anImage.instancePassword
                                                                    };

                                                                    credentialcryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                                                                        if (err) {
                                                                            logger.error('vmware encryptCredential error', err);
                                                                            res.send(500, err);
                                                                            return;
                                                                        }

                                                                        //create instaance
                                                                        logger.debug('Credentials encrypted..');
                                                                        logger.debug('OS Launched');
                                                                        logger.debug(JSON.stringify(createserverdata));
                                                                        //Creating instance in catalyst

                                                                        var instance = {
                                                                            name: createserverdata["vm_name"],
                                                                            orgId: blueprint.orgId,
                                                                            bgId: blueprint.bgId,
                                                                            projectId: blueprint.projectId,
                                                                            envId: req.query.envId,
                                                                            providerId: blueprint.blueprintConfig.cloudProviderId,
                                                                            keyPairId: 'unknown',
                                                                            chefNodeName: createserverdata["vm_name"],
                                                                            runlist: version.runlist,
                                                                            platformId: createserverdata["vm_name"],
                                                                            appUrls: blueprint.appUrls,
                                                                            instanceIP: 'unknown',
                                                                            instanceState: 'unknown',
                                                                            bootStrapStatus: 'waiting',
                                                                            users: blueprint.users,
                                                                            hardware: {
                                                                                platform: 'vmware',
                                                                                platformVersion: 'unknown',
                                                                                architecture: 'unknown',
                                                                                memory: {
                                                                                    total: 'unknown',
                                                                                    free: 'unknown',
                                                                                },
                                                                                os: blueprint.blueprintConfig.instanceOS
                                                                            },
                                                                            credentials: {
                                                                                username: encryptedCredentials.username,
                                                                                password: encryptedCredentials.password
                                                                            },
                                                                            chef: {
                                                                                serverId: blueprint.blueprintConfig.infraManagerId,
                                                                                chefNodeName: createserverdata["vm_name"]
                                                                            },
                                                                            blueprintData: {
                                                                                blueprintId: blueprint._id,
                                                                                blueprintName: blueprint.name,
                                                                                templateId: blueprint.templateId,
                                                                                templateType: blueprint.templateType,
                                                                                iconPath: blueprint.iconpath
                                                                            }

                                                                        };

                                                                        logger.debug('Instance Data');
                                                                        logger.debug(JSON.stringify(instance));

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
                                                                                log: "Waiting for instance ok state",
                                                                                timestamp: timestampStarted
                                                                            });
                                                                            //var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, req.session.user.cn, timestampStarted);
                                                                            //var logsReferenceIds = [instance.id, actionLog._id];
                                                                            //logsDao.insertLog({
                                                                            //    referenceId: logsReferenceIds,
                                                                            //    err: false,
                                                                            //    log: "Waiting for instance ok state",
                                                                            //     timestamp: timestampStarted
                                                                            //  });

                                                                            logger.debug('Returned from Create Instance. About to wait for instance ready state');


                                                                            //waiting for server to become active
                                                                            logger.debug('Returned from Create Instance. About to send response');
                                                                            //res.send(200);
                                                                            res.send(200, {
                                                                                "id": [instance.id],
                                                                                "message": "instance launch success"
                                                                            });
                                                                            logger.debug('Should have sent the response.');
                                                                            vmwareCloud.waitforserverready(appConfig.vmware.serviceHost,createserverdata["vm_name"], anImage.userName, anImage.instancePassword, function(err, publicip) {
                                                                                if (!err) {
                                                                                    logger.debug('Instance Ready....');
                                                                                    logger.debug(JSON.stringify(data)); // logger.debug(data);
                                                                                    logger.debug('About to bootstrap Instance');
                                                                                   
                                                                                    instancesDao.updateInstanceIp(instance.id, publicip, function(err, updateCount) {
                                                                                        if (err) {
                                                                                            logger.error("instancesDao.updateInstanceIp Failed ==>", err);
                                                                                            return;
                                                                                        }
                                                                                        logger.debug('Instance ip Updated');
                                                                                    });
                                                                                    instancesDao.updateInstanceState(instance.id, "running", function(err, updateCount) {
                                                                                        if (err) {
                                                                                            logger.error("instancesDao.updateInstanceState Failed ==>", err);
                                                                                            return;
                                                                                        }
                                                                                        logger.debug('Instance state Updated');
                                                                                    });

                                                                                    logsDao.insertLog({
                                                                                        referenceId: logsReferenceIds,
                                                                                        err: false,
                                                                                        log: "Instance Ready..about to bootstrap",
                                                                                        timestamp: timestampStarted
                                                                                    });

                                                                                    chef.bootstrapInstance({
                                                                                        instanceIp: publicip,
                                                                                        runlist: version.runlist,
                                                                                        instanceUsername: anImage.userName,
                                                                                        instancePassword: anImage.instancePassword, //should be the encryped file 
                                                                                        nodeName: createserverdata["vm_name"],
                                                                                        environment: envName,
                                                                                        instanceOS: instance.hardware.os,
                                                                                        jsonAttributes: null
                                                                                    }, function(err, code) {
                                                                                        if (code == 0) {
                                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                                if (err) {
                                                                                                    logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                                                } else {
                                                                                                    logger.debug("Instance bootstrap status set to success");
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }, function(stdOutData) {

                                                                                        logsDao.insertLog({
                                                                                            referenceId: logsReferenceIds,
                                                                                            err: false,
                                                                                            log: stdOutData.toString('ascii'),
                                                                                            timestamp: new Date().getTime()
                                                                                        });
                                                                                        if (stdOutData.toString('ascii').indexOf("Chef Client finished") > 0) {
                                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                                if (err) {
                                                                                                    logger.error("Unable to set instance bootstarp status. code 0", err);
                                                                                                } else {
                                                                                                    logsDao.insertLog({
                                                                                                    referenceId: logsReferenceIds,
                                                                                                    err: false,
                                                                                                    log: 'Instance Bootstraped Successfully',
                                                                                                    timestamp: new Date().getTime()
                                                                                                });
                                                                                                 
                                                                                                 logger.debug("Instance bootstrap status set to success");

                                                                                                }
                                                                                            });
                                                                                        }

                                                                                    }, function(stdErrData) {

                                                                                        //retrying 4 times before giving up.
                                                                                        logsDao.insertLog({
                                                                                            referenceId: logsReferenceIds,
                                                                                            err: true,
                                                                                            log: stdErrData.toString('ascii'),
                                                                                            timestamp: new Date().getTime()
                                                                                        });

                                                                                    });

                                                                                }
                                                                            }); //end of waitforserverready

                                                                        }); //end of createInstance

                                                                    });
                                                                }
                                                           });



                                                    }
                                                });
                                            }
                                            launchvmwareBP(providerdata,blueprint);
                                        }
                                    });
                                        
                                    
                                }else {
                                    res.send(400, {
                                        message: "Invalid Blueprint Type"
                                    })
                                }
                            });
                        });



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