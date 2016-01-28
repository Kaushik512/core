/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var appConfig = require('_pr/config');

var instancesDao = require('_pr/model/classes/instance/instance');
var EC2 = require('_pr/lib/ec2.js');
var logsDao = require('_pr/model/dao/logsdao.js');
var Docker = require('_pr/model/docker.js');
var Cryptography = require('_pr/lib/utils/cryptography');
var fileIo = require('_pr/lib/utils/fileio');
var uuid = require('node-uuid');
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var VMImage = require('_pr/model/classes/masters/vmImage.js');
var AWSKeyPair = require('_pr/model/classes/masters/cloudprovider/keyPair.js');
var credentialcryptography = require('_pr/lib/credentialcryptography');

var Schema = mongoose.Schema;

var AWSInstanceBlueprintSchema = new Schema({
    keyPairId: {
        type: String,
        required: true,
        trim: true
    },
    subnetId: {
        type: String,
        required: true,
        trim: true
    },
    vpcId: {
        type: String,
        required: true,
        trim: true
    },
    securityGroupIds: {
        type: [String],
        required: true,
        trim: true
    },
    instanceType: {
        type: String,
        //  required: true
    },
    instanceOS: {
        type: String,
        // required: true
    },
    instanceCount: {
        type: String,
    },
    instanceAmiid: {
        type: String,
        //  required: true
    },
    instanceUsername: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        required: true
    }
});

AWSInstanceBlueprintSchema.methods.launch = function(launchParams, callback) {
    var self = this;
    VMImage.getImageById(self.imageId, function(err, anImage) {
        if (err) {
            logger.error(err);
            callback({
                message: "db-error"
            });
            return;
        }
        logger.debug("Loaded Image -- : >>>>>>>>>>> %s", anImage.providerId);
        AWSProvider.getAWSProviderById(anImage.providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                callback({
                    message: "db-error"
                });
                return;
            }
            if (!aProvider) {
                callback({
                    message: "Unable to fetch provider from DB"
                });
                return;
            }
            AWSKeyPair.getAWSKeyPairById(self.keyPairId, function(err, aKeyPair) {
                if (err) {
                    logger.error(err);
                    callback({
                        message: "db-error"
                    });
                    return;
                }

                var cryptoConfig = appConfig.cryptoSettings;
                var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                var keys = [];
                keys.push(aProvider.accessKey);
                keys.push(aProvider.secretKey);
                cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                    if (err) {
                        callback({
                            message: "Failed to decrypt accessKey or secretKey"
                        });
                        return;
                    }

                    logger.debug("Enter launchInstance -- ");
                    // New add
                    //var encryptedPemFileLocation= currentDirectory + '/../catdata/catalyst/provider-pemfiles/';

                    var settings = appConfig;
                    //encrypting default pem file
                    var cryptoConfig = appConfig.cryptoSettings;
                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                    var encryptedPemFileLocation = settings.instancePemFilesDir + aKeyPair._id;
                    var securityGroupIds = [];
                    for (var i = 0; i < self.securityGroupIds.length; i++) {
                        securityGroupIds.push(self.securityGroupIds[i]);
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
                    if (!self.instanceCount) {
                        self.instanceCount = "1";
                    }
                    ec2.launchInstance(anImage.imageIdentifier, self.instanceType, securityGroupIds, self.subnetId, 'D4D-' + launchParams.blueprintName, aKeyPair.keyPairName, self.instanceCount, function(err, instanceDataAll) {
                        if (err) {
                            logger.error("launchInstance Failed >> ", err);
                            callback({
                                message: "Instance Launched Failed"
                            });
                            return;
                        }


                        var newinstanceIDs = [];

                        function addinstancewrapper(instanceData, instancesLength) {
                            logger.debug('Entered addinstancewrapper ++++++' + instancesLength);
                            var instance = {
                                name: launchParams.blueprintName,
                                orgId: launchParams.orgId,
                                bgId: launchParams.bgId,
                                projectId: launchParams.projectId,
                                envId: launchParams.envId,
                                providerId: launchParams.cloudProviderId,
                                providerType: launchParams.cloudProviderType,
                                keyPairId: self.keyPairId,
                                chefNodeName: instanceData.InstanceId,
                                runlist: launchParams.version.runlist,
                                platformId: instanceData.InstanceId,
                                appUrls: launchParams.appUrls,
                                instanceIP: instanceData.PublicIpAddress || instanceData.PrivateIpAddress,
                                instanceState: instanceData.State.Name,
                                bootStrapStatus: 'waiting',
                                users: launchParams.users,
                                hardware: {
                                    platform: 'unknown',
                                    platformVersion: 'unknown',
                                    architecture: 'unknown',
                                    memory: {
                                        total: 'unknown',
                                        free: 'unknown',
                                    },
                                    os: self.instanceOS
                                },
                                credentials: {
                                    username: anImage.userName,
                                    pemFileLocation: encryptedPemFileLocation,
                                },
                                chef: {
                                    serverId: launchParams.infraManagerId,
                                    chefNodeName: instanceData.InstanceId
                                },
                                blueprintData: {
                                    blueprintId: launchParams.blueprintData.id,
                                    blueprintName: launchParams.blueprintData.name,
                                    templateId: launchParams.blueprintData.templateId,
                                    templateType: launchParams.blueprintData.templateType,
                                    templateComponents: launchParams.blueprintData.templateComponents,
                                    iconPath: launchParams.blueprintData.iconpath
                                }
                            };

                            logger.debug('Creating instance in catalyst');
                            instancesDao.createInstance(instance, function(err, data) {
                                if (err) {
                                    logger.error("Failed to create Instance", err);
                                    callback({
                                        message: "Failed to create instance in DB"
                                    });
                                    return;
                                }
                                instance.id = data._id;

                                //Returning handle when all instances are created
                                newinstanceIDs.push(instance.id);
                                logger.debug('Lengths ---- ' + newinstanceIDs.length + '  ' + instancesLength);
                                if (newinstanceIDs.length >= instancesLength) {
                                    callback(null, {
                                        "id": newinstanceIDs,
                                        "message": "instance launch success"
                                    });
                                }
                                var timestampStarted = new Date().getTime();
                                var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, launchParams.sessionUser, timestampStarted);
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
                                            launchParams.blueprintData.getCookBookAttributes(instance.instanceIP, function(err, jsonAttributes) {
                                                var runlist = instance.runlist;
                                                if (launchParams.extraRunlist) {
                                                    runlist = launchParams.extraRunlist.concat(instance.runlist);
                                                }

                                                
                                                launchParams.infraManager.bootstrapInstance({
                                                    instanceIp: instance.instanceIP,
                                                    pemFilePath: tempUncryptedPemFileLoc,
                                                    runlist: runlist,
                                                    instanceUsername: instance.credentials.username,
                                                    nodeName: instance.chef.chefNodeName,
                                                    environment: launchParams.envName,
                                                    instanceOS: instance.hardware.os,
                                                    jsonAttributes: jsonAttributes
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


                                                            launchParams.infraManager.getNode(instance.chefNodeName, function(err, nodeData) {
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
                                            })

                                        });
                                    });
                                });


                            }); //end of create instance.
                        } //end of createinstancewrapper function


                        for (var ic = 0; ic < instanceDataAll.length; ic++) {
                            logger.debug('InstanceDataAll ' + JSON.stringify(instanceDataAll));
                            logger.debug('Length : ' + instanceDataAll.length);
                            addinstancewrapper(instanceDataAll[ic], instanceDataAll.length);
                        }
                    });

                });
            });

        });

    });



};

// static methods
AWSInstanceBlueprintSchema.statics.createNew = function(awsData) {
    var self = this;
    var awsInstanceBlueprint = new self(awsData);
    return awsInstanceBlueprint;
};

var AWSInstanceBlueprint = mongoose.model('AWSInstanceBlueprint', AWSInstanceBlueprintSchema);

module.exports = AWSInstanceBlueprint;