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
var AWSCloudFormation = require('_pr/lib/awsCloudFormation.js');
var masterUtil = require('_pr/lib/utils/masterUtil.js');
var credentialCryptography = require('_pr/lib/credentialcryptography');




module.exports.setRoutes = function(app, sessionVerificationFunc) {


    app.post('/notifications/aws/cfAutoScale', function(req, res) {
        console.log('POST request');
        var notificationType = req.headers['x-amz-sns-message-type'];
        var topicArn = req.headers['x-amz-sns-topic-arn'];
        console.log('headers ==> ', req.headers);

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
                    console.log('url ===> ', confirmationURL);

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
                    if (autoScaleMsg.Service == "AWS Auto Scaling") {
                        var autoScaleId = autoScaleMsg.AutoScalingGroupName;
                        if (autoScaleId) {
                            console.log('finding by autoscale topic arn ==>' + topicArn);

                            if (!topicArn) {
                                return;
                            }
                            CloudFormation.findByAutoScaleTopicArn(topicArn, function(err, cloudFormations) {
                                if (err) {
                                    logger.error(err);
                                    return;
                                }
                                console.log('found by autoscaleid ==>' + cloudFormations.length);
                                if (cloudFormations && cloudFormations.length) {

                                    var cloudFormation = cloudFormations[0];
                                    var awsInstanceId = autoScaleMsg.EC2InstanceId;
                                    if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_TERMINATE') {
                                        logger.debug('removing instance ==> ' + awsInstanceId);

                                        instancesDao.removeInstancebyCloudFormationIdAndAwsId(cloudFormation.id, awsInstanceId, function(err, deleteCount) {
                                            if (err) {
                                                logger.error("Unable to delete instance by cloudformation and instance id", err);
                                                return;
                                            }
                                            logger.debug('notification deleteCount ==>' + deleteCount);
                                        });

                                    } else if (autoScaleMsg.Event === 'autoscaling:EC2_INSTANCE_LAUNCH') {

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

                                                                var runlist = [];
                                                                var instanceUsername;

                                                                /*for (var count = 0; count < blueprint.blueprintConfig.instances.length; count++) {
                                                                if (logicalId === blueprint.blueprintConfig.instances[count].logicalId) {
                                                                    instanceUsername = blueprint.blueprintConfig.instances[count].username;
                                                                    runlist = blueprint.blueprintConfig.instances[count].runlist;
                                                                    break;
                                                                }
                                                            }*/
                                                                if (!instanceUsername) {
                                                                    instanceUsername = 'ubuntu'; // hack for default username
                                                                }

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
                                                                                        instanceOS: instance.hardware.os
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
};