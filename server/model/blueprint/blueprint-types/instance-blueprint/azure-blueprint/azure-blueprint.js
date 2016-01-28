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
var CHEFInfraBlueprint = require('../chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var CLOUD_PROVIDER_TYPE = {
	AWS: 'aws',
	AZURE: 'azure'
};

var INFRA_MANAGER_TYPE = {
	CHEF: 'chef',
	PUPPET: 'puppet'
};

var azureInstanceBlueprintSchema = new Schema({
	cloudProviderType: {
		type: String,
		required: true,
		trim: true
	},
	cloudProviderId: {
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
	region: {
		type: String,
		required: true,
		trim: true
	},
	securityGroupIds: {
		type: String,
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
	imageId: {
		type: String,
		required: true
	},
	cloudProviderData: Schema.Types.Mixed,
	infraMangerType: String,
	infraManagerId: String,
	infraManagerData: Schema.Types.Mixed
});



function getInfraManagerConfigType(blueprint) {
	var InfraManagerConfig;
	if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.CHEF) {
		InfraManagerConfig = CHEFInfraBlueprint;
	} else if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.PUPPET) {
		return null;
	} else {
		return null;
	}
	var infraManagerConfig = new InfraManagerConfig(blueprint.infraManagerData);
	return infraManagerConfig;
}

function getCloudProviderConfigType(blueprint) {
	var CloudProviderConfig;
	if (blueprint.cloudProviderType === CLOUD_PROVIDER_TYPE.AWS) {
		CloudProviderConfig = AWSBlueprint;
	} else if (blueprint.infraMangerType === CLOUD_PROVIDER_TYPE.azure) {
		return null;
	} else {
		return null;
	}
	var cloudProviderConfig = new CloudProviderConfig(blueprint.cloudProviderData);
	return cloudProviderConfig;
}

azureInstanceBlueprintSchema.methods.launch = function(launchParams, callback) {
    var versionData = this.getVersionData(launchParams.ver);
    launchParams.version = versionData;
    var self = this;
    azureProvider.getAzureCloudProviderById(self.cloudProviderId, function(err, providerdata) {
        if (err) {
            logger.error('getAzureCloudProviderById ' + err);
            callback({
                message: "Unable to fetch azure provider"
            });
            return;
        }
        logger.debug("Azure Provider Data:", providerdata);

        function launchAzureCloudBP(providerdata, blueprint) {

            logger.debug("Image Id:", self.imageId);

            VMImage.getImageById(self.imageId, function(err, anImage) {

                    if (err) {
                        logger.error(err);
                        callback({
                            message: "unable to get vm image from db"
                        })
                        return;
                    }
                    anImage = JSON.parse(JSON.stringify(anImage));
                    logger.debug("Loaded Image -- : >>>>>>>>>>> %s", anImage);

                    var launchparamsazure = {

                        VMName: "D4D-" + uuid.v4().split('-')[0],
                        imageName: self.instanceAmiid,
                        size: self.instanceType,
                        vnet: self.vpcId,
                        location: self.region,
                        subnet: self.subnetId,
                        username: anImage.userName,
                        password: anImage.instancePassword,
                        sshPort: "22",
                        endpoints: self.securityGroupIds,
                        os: self.instanceOS
                    }

                    logger.debug("blueprint.blueprintConfig.instanceOS >>>", self.instanceOS);

                    //logger.debug("Azure VM launch params:" + launchparams);

                    logger.debug('providerdata:', providerdata);
                    providerdata = JSON.parse(providerdata);

                    var settings = appConfig;
                    var pemFile = settings.instancePemFilesDir + providerdata._id + providerdata.pemFileName;
                    var keyFile = settings.instancePemFilesDir + providerdata._id + providerdata.keyFileName;

                    logger.debug("pemFile path:", pemFile);
                    logger.debug("keyFile path:", pemFile);

                    var cryptoConfig = appConfig.cryptoSettings;
                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

                    var uniqueVal = uuid.v4().split('-')[0];

                    var decryptedPemFile = pemFile + '_' + uniqueVal + '_decypted';
                    var decryptedKeyFile = keyFile + '_' + uniqueVal + '_decypted';

                    cryptography.decryptFile(pemFile, cryptoConfig.decryptionEncoding, decryptedPemFile, cryptoConfig.encryptionEncoding, function(err) {
                        if (err) {
                            logger.error('Pem file decryption failed>> ', err);
                            return;
                        }

                        cryptography.decryptFile(keyFile, cryptoConfig.decryptionEncoding, decryptedKeyFile, cryptoConfig.encryptionEncoding, function(err) {
                            if (err) {
                                logger.error('key file decryption failed>> ', err);
                                return;
                            }

                            var options = {
                                subscriptionId: providerdata.subscriptionId,
                                certLocation: decryptedPemFile,
                                keyLocation: decryptedKeyFile
                            };

                            var azureCloud = new AzureCloud(options);

                            azureCloud.createServer(launchparamsazure, function(err, instanceData) {
                                if (err) {
                                    logger.error('azure createServer error', err);
                                    callback({
                                        message: "unable to create vm in azure"
                                    });
                                    return;
                                }

                                var credentials = {
                                    username: launchparamsazure.username,
                                    password: launchparamsazure.password
                                };

                                credentialcryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                                    if (err) {
                                        logger.error('azure encryptCredential error', err);
                                        callback({
                                            message: "azure encryptCredential error"
                                        });
                                        return;
                                    }
                                    logger.debug('Credentials encrypted..');
                                    logger.debug('OS Launched');
                                    logger.debug(JSON.stringify(instanceData));
                                    //Creating instance in catalyst

                                    var instance = {
                                        //name: launchparams.VMName,
                                        name: launchParams.blueprintName,
                                        orgId: launchParams.orgId,
                                        bgId: launchParams.bgId,
                                        projectId: launchParams.projectId,
                                        envId: launchParams.envId,
                                        providerId: self.cloudProviderId,
                                        providerType: self.cloudProviderType,
                                        keyPairId: 'azure',
                                        chefNodeName: launchparamsazure.VMName,
                                        runlist: launchParams.version.runlist,
                                        platformId: launchparamsazure.VMName,
                                        appUrls: launchParams.appUrls,
                                        instanceIP: 'pending',
                                        instanceState: 'pending',
                                        bootStrapStatus: 'waiting',
                                        users: launchParams.users,
                                        hardware: {
                                            platform: 'azure',
                                            platformVersion: 'unknown',
                                            architecture: 'unknown',
                                            memory: {
                                                total: 'unknown',
                                                free: 'unknown',
                                            },
                                            os: self.instanceOS
                                        },
                                        credentials: {
                                            username: encryptedCredentials.username,
                                            password: encryptedCredentials.password
                                        },
                                        chef: {
                                            serverId: self.infraManagerId,
                                            chefNodeName: launchparams.VMName
                                        },
                                        blueprintData: {
                                            blueprintId: launchParams.blueprintData._id,
                                            blueprintName: launchParams.blueprintData.name,
                                            templateId: launchParams.blueprintData.templateId,
                                            templateType: launchParams.blueprintData.templateType,
                                            iconPath: launchParams.blueprintData.iconpath
                                        }

                                    };

                                    logger.debug('Instance Data');
                                    logger.debug(JSON.stringify(instance));

                                    instancesDao.createInstance(instance, function(err, data) {
                                        if (err) {
                                            logger.error("Failed to create Instance", err);
                                            callback({
                                                message: "Failed to create instance in db"
                                            })
                                            return;
                                        }

                                        instance.id = data._id;
                                        var timestampStarted = new Date().getTime();
                                        var actionLog = instancesDao.insertBootstrapActionLog(instance.id, instance.runlist, launchParams.sessionUser, timestampStarted);
                                        var logsReferenceIds = [instance.id, actionLog._id];
                                        logsDao.insertLog({
                                            referenceId: logsReferenceIds,
                                            err: false,
                                            log: "Waiting for instance ok state",
                                            timestamp: timestampStarted
                                        });


                                        logger.debug('Returned from Create Instance. About to wait for instance ready state');


                                        //waiting for server to become active
                                        logger.debug('Returned from Create Instance.' + instcount + ' of ' + self.instanceCount + '  About to send response');

                                        azureinstid.push(instance.id);
                                        if (azureinstid.length >= parseInt(self.instanceCount)) {
                                            callback(null, {
                                                "id": azureinstid,
                                                "message": "instance launch success"
                                            });
                                            logger.debug('Should have sent the response.');
                                        }

                                        azureCloud.waitforserverready(launchparamsazure.VMName, launchparamsazure.username, launchparamsazure.password, function(err, publicip) {

                                            if (!err) {
                                                logger.debug('Instance Ready....');
                                                logger.debug(JSON.stringify(data)); // logger.debug(data);
                                                logger.debug('About to bootstrap Instance');
                                                //identifying pulic ip

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
                                                var port = '';

                                                if (instance.hardware.os === 'windows') {
                                                    port = '5985';
                                                } else {
                                                    port = '22';
                                                }

                                                launchParams.infraManager.bootstrapInstance({
                                                    instanceIp: publicip,
                                                    runlist: instance.runlist,
                                                    instanceUsername: launchparamsazure.username,
                                                    instancePassword: launchparamsazure.password, //should be the encryped file 
                                                    nodeName: launchparamsazure.VMName,
                                                    environment: launchParams.envName,
                                                    instanceOS: instance.hardware.os,
                                                    jsonAttributes: null,
                                                    port: port
                                                }, function(err, code) {
                                                    fs.unlink(decryptedPemFile, function(err) {
                                                        logger.debug("Deleting decryptedPemFile..");
                                                        if (err) {
                                                            logger.error("Error in deleting decryptedPemFile..");
                                                        }

                                                        fs.unlink(decryptedKeyFile, function(err) {
                                                            logger.debug("Deleting decryptedKeyFile ..");
                                                            if (err) {
                                                                logger.error("Error in deleting decryptedKeyFile..");
                                                            }
                                                        });
                                                    });

                                                    if (err) {
                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                                            if (err) {
                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
                                                            }
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

                                                    logger.debug("Azure vm bootstrap code:", code);

                                                    if (code == 0) {
                                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                            if (err) {
                                                                logger.error("Unable to set instance bootstarp status. code 0", err);
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



                                            } else {
                                                logger.debug('Err Creating Instance:' + err);
                                                return;
                                            }
                                        });



                                    }); //close of createInstance
                                    //res.send(data);
                                });
                            }); //close createServer
                        }); //decrypt file 1
                    }); //decrypt file 2
                }) //close of VMImage getImageById
        }
        var azureinstid = [];
        var instcount = 0;
        logger.debug('for state:', (instcount < parseInt(self.instanceCount)), parseInt(self.instanceCount));
        for (instcount = 0; instcount < parseInt(self.instanceCount); instcount++) {
            launchAzureCloudBP(providerdata, blueprint);
        }

    });


};

azureInstanceBlueprintSchema.methods.update = function(updateData) {
	infraManagerConfig = getInfraManagerConfigType(this);
	infraManagerConfig.update(updateData);
	this.infraManagerData = infraManagerConfig;
};

azureInstanceBlueprintSchema.methods.getVersionData = function(ver) {
	infraManagerConfig = getInfraManagerConfigType(this);
	return infraManagerConfig.getVersionData(ver);

};

azureInstanceBlueprintSchema.methods.getLatestVersion = function() {
	infraManagerConfig = getInfraManagerConfigType(this);
	return infraManagerConfig.getLatestVersion();

};

azureInstanceBlueprintSchema.methods.getInfraManagerData = function() {
	return {
		infraMangerType: this.infraManagerType,
		infraManagerId: this.infraManagerId,
		infraManagerData: this.infraManagerData
	};
};

azureInstanceBlueprintSchema.methods.getCloudProviderData = function() {
	return {
		cloudProviderType: this.cloudProviderType,
		cloudProviderId: this.cloudProviderId,
		cloudProviderData: this.cloudProviderData
	};
};

azureInstanceBlueprintSchema.statics.createNew = function(data) {
	var self = this;
	logger.debug('In azureInstanceBlueprintSchema createNew');

	var infraManagerBlueprint = CHEFInfraBlueprint.createNew({
		runlist: data.runlist
	});

	logger.debug(JSON.stringify(data));

	var azureInstanceBlueprint = new self({
		cloudProviderType: data.cloudProviderType,
		cloudProviderId: data.cloudProviderId,
		securityGroupIds: data.securityGroupIds,
		instanceType: data.instanceType,
		instanceAmiid: data.instanceAmiid,
		vpcId: data.vpcId,
		region: data.region,
		subnetId: data.subnetId,
		imageId: data.imageId,
		instanceOS: data.instanceOS,
		instanceCount: data.instanceCount,
		infraMangerType: data.infraManagerType,
		infraManagerId: data.infraManagerId,
		infraManagerData: infraManagerBlueprint
	});

	return azureInstanceBlueprint;
};

var azureInstanceBlueprint = mongoose.model('azureInstanceBlueprint', azureInstanceBlueprintSchema);

module.exports = azureInstanceBlueprint;