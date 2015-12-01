var https = require('https');
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

var CloudFormation = require('_pr/model/cloud-formation');
var AwsAutoScaleInstance = require('_pr/model/aws-auto-scale-instance');
var AWSCloudFormation = require('_pr/lib/awsCloudFormation.js');
var masterUtil = require('_pr/lib/utils/masterUtil.js');
var credentialCryptography = require('_pr/lib/credentialcryptography');


var crontab = require('node-crontab');

var vmwareProvider = require('_pr/model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var VmwareCloud = require('_pr/lib/vmware.js');







module.exports.setRoutes = function(app, socketIo) {


    // setting up socket.io

    var socketCloudFormationAutoScate = socketIo.of('/cloudFormationAutoScaleGroup');

    socketCloudFormationAutoScate.on('connection', function(socket) {
        socket.on('joinCFRoom', function(data) {
            console.log('room joined', data);
            socket.join(data.orgId + ':' + data.bgId + ':' + data.projId + ':' + data.envId);
            // setTimeout(function(){
            //  console.log('firing timeout');
            //  socketCloudFormationAutoScate.to(data.orgId + ':' + data.bgId + ':' + data.projId + ':' + data.envId).emit('cfAutoScaleInstanceRemoved',{
            //     instanceId:'560d17697c5a558126d5b1df'
            //  });
            // },15000)
        });

    });



    app.post('/notifications/aws/cfAutoScale', function(req, res) {
        var notificationType = req.headers['x-amz-sns-message-type'];
        var topicArn = req.headers['x-amz-sns-topic-arn'];

        var bodyarr = [];
        var reqBody;
        req.on('data', function(chunk) {
            bodyarr.push(chunk);
        })
        req.on('end', function() {
            var reqBody = JSON.parse(bodyarr.join(''));
            if (notificationType) {
                if (notificationType === 'SubscriptionConfirmation') { // confirmation notification
                    var confirmationURL = reqBody.SubscribeURL;

                    if (confirmationURL) {
                        https.get(confirmationURL, function(res) {
                            console.log("Got response: " + res.statusCode);
                        }).on('error', function(e) {
                            console.log("Got error: " + e.message);
                        });
                        res.send(200);
                    } else {
                        res.send(400);
                    }

                } else if (notificationType === 'Notification') { // message notification
                    console.log('Got message');
                    console.log(' Notification Subject ==> ', reqBody.Subject);
                    console.log(' Notification Message  ==> ', reqBody.Message);
                    var autoScaleMsg = JSON.parse(reqBody.Message);
                    console.log("service ==> " + typeof autoScaleMsg);
                    if (autoScaleMsg.Service == "AWS Auto Scaling" && autoScaleMsg.StatusCode !== 'Failed') {
                        var autoScaleId = autoScaleMsg.AutoScalingGroupName;
                        if (autoScaleId) {
                            console.log('finding by autoscale topic arn ==>' + topicArn);

                            if (!topicArn) {
                                return;
                            }
                            CloudFormation.findByAutoScaleResourceId(autoScaleId, function(err, cloudFormations) {
                                if (err) {
                                    logger.error(err);
                                    return;
                                }
                                console.log('found by autoscaleid ==>' + cloudFormations.length);
                                if (cloudFormations && cloudFormations.length) {

                                    var cloudFormation = cloudFormations[0];
                                    var awsInstanceId = autoScaleMsg.EC2InstanceId;
                                    if (!awsInstanceId) {
                                        logger.error('Unable to get instance Id from notification');
                                        return;
                                    }
                                    if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_TERMINATE') {
                                        logger.debug('removing instance ==> ' + awsInstanceId);



                                        instancesDao.findInstancebyCloudFormationIdAndAwsId(cloudFormation.id, awsInstanceId, function(err, instances) {
                                            if (err) {
                                                logger.error("Unable to fetch instance by cloudformation and instance id", err);
                                                return;
                                            }
                                            for (var i = 0; i < instances.length; i++) {
                                                (function(instance) {
                                                    instancesDao.removeInstancebyId(instance.id, function(err) {
                                                        if (err) {
                                                            logger.error("Unable to delete instance by instance id", err);
                                                            return;
                                                        }
                                                        console.log('emiting delete event');
                                                        socketCloudFormationAutoScate.to(instance.orgId + ':' + instance.bgId + ':' + instance.projectId + ':' + instance.envId).emit('cfAutoScaleInstanceRemoved', {
                                                            instanceId: instance.id,
                                                            cloudformationId: cloudFormation.id
                                                        });


                                                    });
                                                })(instances[i]);
                                            }
                                        });

                                    } else if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_LAUNCH') {
                                        if (!cloudFormation.infraManagerId) {
                                            logger.error("Inframanager id not found for cloudformation stack id : " + cloudformation.id);
                                            return;
                                        }
                                        masterUtil.getCongifMgmtsById(cloudFormation.infraManagerId, function(err, infraManagerDetails) {
                                            if (err) {
                                                logger.error("Unable to fetch infra manager details ", err);
                                                return;
                                            }
                                            //logger.debug("infraManagerDetails", infraManagerDetails);
                                            if (!infraManagerDetails) {
                                                logger.error("infra manager details is null");
                                                return;
                                            }

                                            AWSProvider.getAWSProviderById(cloudFormation.cloudProviderId, function(err, aProvider) {
                                                if (err) {
                                                    logger.error("Unable to fetch provide", err);
                                                    return;
                                                }
                                                var cryptoConfig = appConfig.cryptoSettings;
                                                var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                                var keys = [];
                                                keys.push(aProvider.accessKey);
                                                keys.push(aProvider.secretKey);
                                                cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                                    if (err) {
                                                        logger.error("Unable to decrypt aws keys ", err);
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

                                                    var awsSettings = {
                                                        "access_key": decryptedKeys[0],
                                                        "secret_key": decryptedKeys[1],
                                                        "region": cloudFormation.region
                                                    };

                                                    var ec2 = new EC2(awsSettings);
                                                    var instances = [];
                                                    logger.debug('aws Instance Id == ' + awsInstanceId);
                                                    if (!awsInstanceId) {
                                                        return;
                                                    }

                                                    ec2.describeInstances([awsInstanceId], function(err, awsRes) {
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
                                                        logger.debug('Instances length ==>', instances.length);
                                                        //creating jsonAttributesObj ??? WHY 
                                                        var jsonAttributesObj = {
                                                            instances: {}
                                                        };

                                                        /*for (var i = 0; i < instances.length; i++) {
                                                            jsonAttributesObj.instances[ec2Resources[instances[i].InstanceId]] = instances[i].PublicIpAddress;
                                                        }*/
                                                        for (var i = 0; i < instances.length; i++) {
                                                            addAndBootstrapInstance(instances[i], jsonAttributesObj);
                                                        }

                                                        function addAndBootstrapInstance(instanceData, jsonAttributesObj) {

                                                            var keyPairName = instanceData.KeyName;
                                                            AWSKeyPair.getAWSKeyPairByProviderIdAndKeyPairName(cloudFormation.cloudProviderId, keyPairName, function(err, keyPairs) {
                                                                if (err) {
                                                                    logger.error("Unable to get keypairs", err);
                                                                    return;
                                                                }
                                                                if (!(keyPairs && keyPairs.length)) {
                                                                    return;
                                                                }
                                                                var keyPair = keyPairs[0];
                                                                var encryptedPemFileLocation = appConfig.instancePemFilesDir + keyPair._id;

                                                                var appUrls = [];
                                                                if (appConfig.appUrls && appConfig.appUrls.length) {
                                                                    appUrls = appUrls.concat(appConfig.appUrls);
                                                                }
                                                                var os = instanceData.Platform;
                                                                if (os) {
                                                                    os = 'windows';
                                                                } else {
                                                                    os = 'linux';
                                                                }
                                                                var instanceName = cloudFormation.stackName + '-AutoScale';
                                                                if (instanceData.Tags && instanceData.Tags.length) {
                                                                    for (var j = 0; j < instanceData.Tags.length; j++) {
                                                                        if (instanceData.Tags[j].Key === 'Name') {
                                                                            instanceName = instanceData.Tags[j].Value;
                                                                        }

                                                                    }
                                                                }

                                                                var runlist = cloudFormation.autoScaleRunlist || [];
                                                                var instanceUsername = cloudFormation.autoScaleUsername || 'ubuntu';
                                                                /*
                                                                for (var count = 0; count < blueprint.blueprintConfig.instances.length; count++) {
                                                                if (logicalId === blueprint.blueprintConfig.instances[count].logicalId) {
                                                                    instanceUsername = blueprint.blueprintConfig.instances[count].username;
                                                                    runlist = blueprint.blueprintConfig.instances[count].runlist;
                                                                    break;
                                                                }
                                                                }*/



                                                                var instance = {
                                                                    name: instanceName,
                                                                    orgId: cloudFormation.orgId,
                                                                    bgId: cloudFormation.bgId,
                                                                    projectId: cloudFormation.projectId,
                                                                    envId: cloudFormation.envId,
                                                                    providerId: cloudFormation.cloudProviderId,
                                                                    keyPairId: keyPair._id,
                                                                    chefNodeName: instanceData.InstanceId,
                                                                    runlist: runlist,
                                                                    platformId: instanceData.InstanceId,
                                                                    appUrls: appUrls,
                                                                    instanceIP: instanceData.PublicIpAddress || instanceData.PrivateIpAddress,
                                                                    instanceState: instanceData.State.Name,
                                                                    bootStrapStatus: 'waiting',
                                                                    users: cloudFormation.users,
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
                                                                    /*blueprintData: {
                                                                    blueprintId: blueprint._id,
                                                                    blueprintName: blueprint.name,
                                                                    templateId: blueprint.templateId,
                                                                    templateType: blueprint.templateType,
                                                                    templateComponents: blueprint.templateComponents,
                                                                    iconPath: blueprint.iconpath
                                                                },*/
                                                                    cloudFormationId: cloudFormation._id
                                                                };

                                                                if (infraManagerDetails.configType === 'chef') {
                                                                    instance.chef = {
                                                                        serverId: infraManagerDetails.rowid,
                                                                        chefNodeName: instanceName + '-' + instance.instanceIP
                                                                    }
                                                                } else {
                                                                    instance.puppet = {
                                                                        serverId: infraManagerDetails.rowid
                                                                            /*chefNodeName: req.body.fqdn*/
                                                                    }
                                                                }



                                                                logger.debug('Creating instance in catalyst');
                                                                instancesDao.createInstance(instance, function(err, data) {
                                                                    logger.debug("Instance Created");
                                                                    if (err) {
                                                                        logger.error("Failed to create Instance", err);
                                                                        return;
                                                                    }
                                                                    instance.id = data._id;
                                                                    var timestampStarted = new Date().getTime();
                                                                    var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, "autoscale-user", timestampStarted);
                                                                    var logsReferenceIds = [instance.id, actionLog._id];
                                                                    logsDao.insertLog({
                                                                        referenceId: logsReferenceIds,
                                                                        err: false,
                                                                        log: "Waiting for instance ok state",
                                                                        timestamp: timestampStarted
                                                                    });
                                                                    logger.debug("Saving logs");
                                                                    logger.debug("Waiting for instance " + instanceData.InstanceId);

                                                                    //emiting socket event

                                                                    socketCloudFormationAutoScate.to(instance.orgId + ':' + instance.bgId + ':' + instance.projectId + ':' + instance.envId).emit('cfAutoScaleInstanceAdded', data);



                                                                    ec2.waitForEvent(instanceData.InstanceId, 'instanceStatusOk', function(err) {
                                                                        logger.debug("Wait Complete " + instanceData.InstanceId);
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
                                                                        credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
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

                                                                            configmgmtDao.getEnvNameFromEnvId(cloudFormation.envId, function(err, envName) {

                                                                                if (err) {
                                                                                    logger.error('Unable to fetch env name from envId', err);
                                                                                    return;
                                                                                }


                                                                                var infraManager;
                                                                                var bootstrapOption;
                                                                                if (infraManagerDetails.configType === 'chef') {
                                                                                    console.log('In chef ');
                                                                                    infraManager = new Chef({
                                                                                        userChefRepoLocation: infraManagerDetails.chefRepoLocation,
                                                                                        chefUserName: infraManagerDetails.loginname,
                                                                                        chefUserPemFile: infraManagerDetails.userpemfile,
                                                                                        chefValidationPemFile: infraManagerDetails.validatorpemfile,
                                                                                        hostedChefUrl: infraManagerDetails.url
                                                                                    });
                                                                                    bootstrapOption = {
                                                                                        instanceIp: instance.instanceIP,
                                                                                        pemFilePath: decryptedCredentials.pemFileLocation,
                                                                                        instancePassword: decryptedCredentials.password,
                                                                                        instanceUsername: instance.credentials.username,
                                                                                        nodeName: instance.chef.chefNodeName,
                                                                                        environment: envName,
                                                                                        instanceOS: instance.hardware.os,
                                                                                        runlist: instance.runlist
                                                                                    };
                                                                                } else {
                                                                                    var puppetSettings = {
                                                                                        host: infraManagerDetails.hostname,
                                                                                        username: infraManagerDetails.username,
                                                                                    };
                                                                                    if (infraManagerDetails.pemFileLocation) {
                                                                                        puppetSettings.pemFileLocation = infraManagerDetails.pemFileLocation;
                                                                                    } else {
                                                                                        puppetSettings.password = infraManagerDetails.puppetpassword;
                                                                                    }
                                                                                    console.log('puppet pemfile ==> ' + puppetSettings.pemFileLocation);
                                                                                    bootstrapOption = {
                                                                                        host: instance.instanceIP,
                                                                                        username: instance.credentials.username,
                                                                                        pemFileLocation: decryptedCredentials.pemFileLocation,
                                                                                        password: decryptedCredentials.password,
                                                                                        environment: envName
                                                                                    };

                                                                                    infraManager = new Puppet(puppetSettings);
                                                                                }

                                                                                infraManager.bootstrapInstance(bootstrapOption, function(err, code, bootstrapData) {

                                                                                    if (err) {
                                                                                        logger.error("knife launch err ==>", err);
                                                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                                                                        });
                                                                                        if (err.message) {
                                                                                            var timestampEnded = new Date().getTime();
                                                                                            logsDao.insertLog({
                                                                                                referenceId: logsReferenceIds,
                                                                                                err: true,
                                                                                                log: err.message,
                                                                                                timestamp: timestampEnded
                                                                                            });

                                                                                        }
                                                                                        var timestampEnded = new Date().getTime();
                                                                                        logsDao.insertLog({
                                                                                            referenceId: logsReferenceIds,
                                                                                            err: true,
                                                                                            log: "Bootstrap Failed",
                                                                                            timestamp: timestampEnded
                                                                                        });
                                                                                        instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);

                                                                                    } else {
                                                                                        if (code == 0) {
                                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                                                if (err) {
                                                                                                    logger.error("Unable to set instance bootstarp status. code 0");
                                                                                                } else {
                                                                                                    logger.debug("Instance bootstrap status set to success");
                                                                                                }
                                                                                            });

                                                                                            // updating puppet node name
                                                                                            var nodeName;
                                                                                            if (bootstrapData && bootstrapData.puppetNodeName) {
                                                                                                instancesDao.updateInstancePuppetNodeName(instance.id, bootstrapData.puppetNodeName, function(err, updateData) {
                                                                                                    if (err) {
                                                                                                        logger.error("Unable to set puppet node name");
                                                                                                    } else {
                                                                                                        logger.debug("puppet node name updated successfully");
                                                                                                    }
                                                                                                });
                                                                                                nodeName = bootstrapData.puppetNodeName;
                                                                                            } else {
                                                                                                nodeName = instance.chef.chefNodeName;
                                                                                            }


                                                                                            var timestampEnded = new Date().getTime();
                                                                                            logsDao.insertLog({
                                                                                                referenceId: logsReferenceIds,
                                                                                                err: false,
                                                                                                log: "Instance Bootstrapped Successfully",
                                                                                                timestamp: timestampEnded
                                                                                            });
                                                                                            instancesDao.updateActionLog(instance.id, actionLog._id, true, timestampEnded);
                                                                                            var hardwareData = {};
                                                                                            if (bootstrapData && bootstrapData.puppetNodeName) {
                                                                                                var runOptions = {
                                                                                                    username: decryptedCredentials.username,
                                                                                                    host: instance.instanceIP,
                                                                                                    port: 22,
                                                                                                }

                                                                                                if (decryptedCredentials.pemFileLocation) {
                                                                                                    runOptions.pemFileLocation = decryptedCredentials.pemFileLocation;
                                                                                                } else {
                                                                                                    runOptions.password = decryptedCredentials.password;
                                                                                                }

                                                                                                infraManager.runClient(runOptions, function(err, retCode) {
                                                                                                    if (decryptedCredentials.pemFileLocation) {
                                                                                                        fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                                                                                            if (err) {
                                                                                                                logger.debug("Unable to delete temp pem file =>", err);
                                                                                                            } else {
                                                                                                                logger.debug("temp pem file deleted =>", err);
                                                                                                            }
                                                                                                        });
                                                                                                    }
                                                                                                    if (err) {
                                                                                                        logger.error("Unable to run puppet client", err);
                                                                                                        return;
                                                                                                    }
                                                                                                    // waiting for 30 sec to update node data
                                                                                                    setTimeout(function() {
                                                                                                        infraManager.getNode(nodeName, function(err, nodeData) {
                                                                                                            if (err) {
                                                                                                                console.log(err);
                                                                                                                return;
                                                                                                            }
                                                                                                            // is puppet node
                                                                                                            hardwareData.architecture = nodeData.facts.values.hardwaremodel;
                                                                                                            hardwareData.platform = nodeData.facts.values.operatingsystem;
                                                                                                            hardwareData.platformVersion = nodeData.facts.values.operatingsystemrelease;
                                                                                                            hardwareData.memory = {
                                                                                                                total: 'unknown',
                                                                                                                free: 'unknown'
                                                                                                            };
                                                                                                            hardwareData.memory.total = nodeData.facts.values.memorysize;
                                                                                                            hardwareData.memory.free = nodeData.facts.values.memoryfree;
                                                                                                            hardwareData.os = instance.hardware.os;
                                                                                                            instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                                                                                                if (err) {
                                                                                                                    logger.error("Unable to set instance hardware details  code (setHardwareDetails)", err);
                                                                                                                } else {
                                                                                                                    logger.debug("Instance hardware details set successessfully");
                                                                                                                }
                                                                                                            });
                                                                                                        });
                                                                                                    }, 30000);
                                                                                                });

                                                                                            } else {
                                                                                                infraManager.getNode(nodeName, function(err, nodeData) {
                                                                                                    if (err) {
                                                                                                        logger.error("unable to fetch node data from chef", err);
                                                                                                        return;
                                                                                                    }
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
                                                                                                    if (decryptedCredentials.pemFilePath) {
                                                                                                        fileIo.removeFile(decryptedCredentials.pemFilePath, function(err) {
                                                                                                            if (err) {
                                                                                                                logger.error("Unable to delete temp pem file =>", err);
                                                                                                            } else {
                                                                                                                logger.debug("temp pem file deleted");
                                                                                                            }
                                                                                                        });
                                                                                                    }
                                                                                                });

                                                                                            }



                                                                                        } else {
                                                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                                                                if (err) {
                                                                                                    logger.error("Unable to set instance bootstarp status code != 0");
                                                                                                } else {
                                                                                                    logger.debug("Instance bootstrap status set to failed");
                                                                                                }
                                                                                            });

                                                                                            var timestampEnded = new Date().getTime();
                                                                                            logsDao.insertLog({
                                                                                                referenceId: logsReferenceIds,
                                                                                                err: true,
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
                                                                });

                                                            });


                                                        }

                                                    });



                                                });
                                            });

                                        });
                                    }
                                } else {
                                    // creating or removing a temp entry in database for this notification
                                    var awsInstanceId = autoScaleMsg.EC2InstanceId;
                                    if (!awsInstanceId) {
                                        logger.error('Unable to get instance Id from notification');
                                        return;
                                    }
                                    if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_TERMINATE') {
                                        // removing the entry from temp database if any
                                        AwsAutoScaleInstance.removeByAutoScaleResourceAndInstanceId(autoScaleId, awsInstanceId, function(err, deleteCount) {
                                            if (err) {
                                                logger.error("Unable to delete by resourceId and instanceId", autoScaleId, awsInstanceId);
                                                return;
                                            }
                                            logger.debug("Deleted ==>" + JSON.stringify(deleteCount));
                                        });

                                    } else if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_LAUNCH') {
                                        AwsAutoScaleInstance.createNew({
                                            autoScaleResourceId: autoScaleId,
                                            awsInstanceId: awsInstanceId
                                        }, function(err, autoScaleInstance) {
                                            if (err) {
                                                logger.error("Unable to create aws autoscale instance");
                                                return;
                                            }
                                            logger.debug("Added instance notification in temp database");

                                        });
                                    }


                                }
                            });
                        }
                    }

                    res.send(200);
                }
            } else {
                res.send(400);
            }
            res.send(200);
        });
    });

    // Sync instance status AWS with Catalyst.

    var jobId = crontab.scheduleJob("*/3 * * * *", function() { //This will call this function every 3 minutes 
        logger.debug("Cron Job run every 3 minutes!");
        var instanceState = socketIo.of('/insState');
        var socketList = [];
        instancesDao.getAllInstances(function(err, instances) {
            if (err) {
                logger.debug("Error while getElementBytting instance!");
            }

            if (instances.length > 0) {
                //var instanceIds = [];
                for (var ins = 0; ins < instances.length; ins++) {
                    (function(ins) {
                        //proceed only if the instance is part of the aws provider
                        if (instances[ins].providerId) {
                            AWSProvider.getAWSProviderById(instances[ins].providerId, function(err, aProvider) {
                                if (err) {
                                    logger.debug("Failed to get Provider!");
                                }
                                logger.debug("Got Provider: ", JSON.stringify(aProvider));
                                if (aProvider) {
                                    if (aProvider.providerType === "AWS") { // AWS
                                        AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id, function(err, aKeyPair) {
                                            if (err) {
                                                logger.debug("Failed to get KeyPair!");
                                            }
                                            logger.debug("Got KeyPair: ");
                                            if (aKeyPair) {
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
                                                    var ec2 = new EC2({
                                                        "access_key": decryptedKeys[0],
                                                        "secret_key": decryptedKeys[1],
                                                        "region": aKeyPair[0].region
                                                    });
                                                    logger.debug("AWS ec2: ", JSON.stringify(ec2));
                                                    var instanceIds = [];
                                                    instanceIds.push(instances[ins].platformId);
                                                    ec2.describeInstances(instanceIds, function(err, awsInstances) {
                                                        logger.debug("got reponse from aws instance: ", JSON.stringify(awsInstances));
                                                        if (err) {
                                                            if (err.statusCode === 400 && instances[ins].instanceState != "terminated") {
                                                                logger.debug("Failed to describe Instances from AWS!", err);
                                                                instancesDao.updateInstanceState(instances[ins]._id, "terminated", function(err, data) {
                                                                    if (err) {
                                                                        logger.error("Failed to updateInstance State!", err);
                                                                        return;
                                                                    }
                                                                    var instance = instances[ins];
                                                                    instance.instanceState = "terminated";
                                                                    socketCloudFormationAutoScate.to(instance.orgId + ':' + instance.bgId + ':' + instance.projectId + ':' + instance.envId).emit('instanceStateChanged', instance);

                                                                    logger.debug("Exit updateInstanceState: ");
                                                                });
                                                            }
                                                            return;
                                                        }

                                                        //logger.debug("Described Instances from AWS: ", JSON.stringify(awsInstances));
                                                        if (awsInstances) {
                                                            if (awsInstances.Reservations.length === 0) {
                                                                if (instances[ins].instanceState != "terminated") {
                                                                    instancesDao.updateInstanceState(instances[ins]._id, "terminated", function(err, data) {
                                                                        if (err) {
                                                                            logger.error("Failed to updateInstance State!", err);
                                                                            return;
                                                                        }
                                                                        var instance = instances[ins];
                                                                        instance.instanceState = "terminated";
                                                                        socketCloudFormationAutoScate.to(instance.orgId + ':' + instance.bgId + ':' + instance.projectId + ':' + instance.envId).emit('instanceStateChanged', instance);

                                                                        logger.debug("Exit updateInstanceState: ");
                                                                    });
                                                                }
                                                                return;
                                                            }

                                                            logger.debug("instances[ins].platformId=>>>>> ", instances[ins].platformId + " awsInstances.Reservations[x].Instances[0].instanceId=>>>>>>> ", awsInstances.Reservations[0].Instances[0].InstanceId);
                                                            if (instances[ins].platformId === awsInstances.Reservations[0].Instances[0].InstanceId) {
                                                                logger.debug("Status does not matched.....", instances[ins]._id);
                                                                instancesDao.updateInstanceState(instances[ins]._id, awsInstances.Reservations[0].Instances[0].State.Name, function(err, data) {
                                                                    if (err) {
                                                                        logger.error("Failed to updateInstance State!", err);
                                                                        return;
                                                                    }
                                                                    var instance = instances[ins];
                                                                    instance.instanceState = awsInstances.Reservations[0].Instances[0].State.Name;
                                                                    socketCloudFormationAutoScate.to(instance.orgId + ':' + instance.bgId + ':' + instance.projectId + ':' + instance.envId).emit('instanceStateChanged', instance);


                                                                    logger.debug("Exit updateInstanceState: ");
                                                                });
                                                                return;
                                                            }
                                                        }

                                                    });
                                                });
                                            }
                                        });
                                    } else if (aProvider.providerType === "AZURE") { // Azure Provider

                                    } else if (aProvider.providerType === "HPPUBLICCLOUD") { // HP Cloud

                                    } else if (aProvider.providerType === "OPENSTACK") { // Openstack

                                    } else if (aProvider.providerType === "VMWARE") { // VMWare functionality not implemented yet
                                        //get all instances running on the vmware server
                                        var vmwareCloud = new VmwareCloud(aProvider);
                                        vmwareCloud.getVms(appConfig.vmware.serviceHost, function(err, vmHost) {
                                            if (err) {
                                                logger.debug("Failed to get VmWare VM: ", err);
                                            }
                                            if (vmHost["vms"].length) {
                                                for (var v = 0; v < vmHost["vms"].length; v++) {
                                                    (function(v) {
                                                        if (vmHost.vms[v]["state"] == "poweredOn") {}
                                                    })(v);
                                                }
                                            }

                                        });
                                    }
                                }
                            });
                            //get instance  from id
                            /**
                            var thisinstance = function(instanceid, callback) {
                                //    logger.debug('get instance thisinstance called');
                                for (var i = 0; i < instances.length; i++) {
                                    if (instances[i]._id == instanceid) {
                                        //   logger.debug('found match:',i,instanceid,instances[i]._id );
                                        callback(instances[i]);
                                        break;
                                    }
                                }
                            }

                            //get all vmware providers
                            instances = JSON.parse(JSON.stringify(instances));
                            //to be removed when in dc.
                            return;
                            vmwareProvider.getvmwareProviders(function(err, aProvider) {
                                if (err) {
                                    logger.debug("Failed to get Provider!");
                                }
                                //logger.debug("Got vmware Provider: ", JSON.stringify(aProvider));
                                aProvider = JSON.parse(JSON.stringify(aProvider));
                                if (aProvider) {

                                    //proceed only if the instance is part of the aws provider
                                    for (var ap = 0; ap < aProvider.length; ap++) {
                                        //loop to eliminate instances that are not part of the provider
                                        var instanceIds = [];
                                        //filtering by provider
                                        for (var i = 0; i < instances.length; i++) {
                                            if (instances[i].platformId && instances[i].providerId) {
                                                //add only if provider matches
                                                if (instances[i].providerId == aProvider[ap]._id)
                                                    instanceIds.push(instances[i]._id);
                                                // else
                                                //     logger.debug('Instance does not belong to provider(instance providerid,providerid):',instances[i].providerId,aProvider[ap]._id);
                                            }
                                        }

                                        if (instanceIds.length <= 0) {
                                            continue; //skip next steps if not part of provider.
                                        } else {
                                            logger.debug('Instances matching vmware provider:', instanceIds);
                                            //get all instances running on the vmware server
                                            var vmwareCloud = new VmwareCloud(aProvider[ap]);

                                            vmwareCloud.getVms(appConfig.vmware.serviceHost, function(err, vmsonhost) {
                                                if (!err) {

                                                    vmsonhost = JSON.parse(JSON.stringify(JSON.parse(vmsonhost)));
                                                    //  logger.debug('vmsonhost:',JSON.stringify(vmsonhost));
                                                    for (var i = 0; i < instanceIds.length; i++) {
                                                        // logger.debug('Instance Details');
                                                        //"toolsStatus":"guestToolsRunning","state":"poweredOn"
                                                        for (var j = 0; j < vmsonhost["vms"].length; j++) {
                                                            //   logger.debug('VMState:',vmsonhost.vms[j]["state"]);
                                                            if (vmsonhost.vms[j]["state"] == "poweredOn") {
                                                                thisinstance(instanceIds[i], function(thisinst) {
                                                                    if (thisinst) {
                                                                        if (thisinst.instanceState != 'running') {
                                                                            instancesDao.updateInstanceState(thisinst._id, 'running', function(err, data) {
                                                                                if (err) {
                                                                                    logger.error("Failed to updateInstance State!", err);
                                                                                    callback(err, null);
                                                                                    return;
                                                                                }
                                                                                // logger.debug("Exit updateInstanceState: running ");
                                                                            });
                                                                        }
                                                                    }

                                                                });
                                                            } else {
                                                                thisinstance(instanceIds[i], function(thisinst) {
                                                                    if (thisinst) {
                                                                        if (thisinst.instanceState == 'running') {
                                                                            instancesDao.updateInstanceState(thisinst._id, 'stopped', function(err, data) {
                                                                                if (err) {
                                                                                    logger.error("Failed to updateInstance State!", err);
                                                                                    callback(err, null);
                                                                                    return;
                                                                                }
                                                                                //    logger.debug("Exit updateInstanceState: stopped");
                                                                            });
                                                                        }
                                                                    }

                                                                });
                                                            }

                                                        }
                                                    }
                                                } else {
                                                    logger.debug("Failed to describe Instances from vmware host!", err);

                                                }
                                            });

                                        }

                                    }
                                }

                            }); **/
                        }
                    })(ins);
                } // instance for loop

            }
        });
    });




};
