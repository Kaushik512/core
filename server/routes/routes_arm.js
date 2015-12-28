var AzureArm = require('_pr/model/azure-arm');
var errorResponses = require('./error_responses');
var AWSCloudFormation = require('_pr/lib/awsCloudFormation');
var appConfig = require('_pr/config');
var Cryptography = require('_pr/lib/utils/cryptography');
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var logger = require('_pr/logger')(module);
var instancesDao = require('_pr/model/classes/instance/instance');
var configmgmtDao = require('_pr/model/d4dmasters/configmgmt');
var Chef = require('_pr/lib/chef.js');
var ARM = require('_pr/lib/azure-arm.js');
var azureProvider = require('_pr/model/classes/masters/cloudprovider/azureCloudProvider.js');
var appConfig = require('_pr/config');
var uuid = require('node-uuid');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/azure-arm/*', sessionVerificationFunc);


    app.get('/azure-arm/:providerId/resourceGroups', function(req, res) {
        azureProvider.getAzureCloudProviderById(req.params.providerId, function(err, providerdata) {
            if (err) {
                logger.error('getAzureCloudProviderById ' + err);
                return;
            }

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

                    var arm = new ARM(options);
                    arm.getResourceGroups(function(err, body) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        res.status(200).send(body);

                    });
                });
            });
        });
    });

    app.post('/azure-arm/:providerId/resourceGroups', function(req, res) {
        azureProvider.getAzureCloudProviderById(req.params.providerId, function(err, providerdata) {
            if (err) {
                logger.error('getAzureCloudProviderById ' + err);
                return;
            }

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

                    var arm = new ARM(options);
                    arm.createResourceGroup(req.body.name,function(err, body) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        res.status(200).send(body);

                    });
                });
            });
        });
    });

    app.get('/azure-arm/:armId', function(req, res) {
        AzureArm.getById(req.params.armId, function(err, azureArm) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (azureArm) {
                res.send(200, azureArm);

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });


    app.get('/azure-arm/:armId/status', function(req, res) {
        AzureArm.getById(req.params.armId, function(err, azureArm) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (azureArm) {
                res.send(200, {
                    status: azureArm.status
                });

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });

    app.delete('/azure-arm/:cfId', function(req, res) {

        function removeInstanceFromDb(instanceId) {
            instancesDao.removeInstancebyId(req.params.instanceId, function(err, data) {
                if (err) {
                    logger.error("Instance deletion Failed >> ", err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                logger.debug("Exit delete() for /instances/%s", req.params.instanceid);
                res.send(200);
            });
        }


        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                AWSProvider.getAWSProviderById(cloudFormation.cloudProviderId, function(err, aProvider) {
                    if (err) {
                        logger.error("Unable to fetch provide", err);
                        res.send(500, errorResponses.db.error);
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

                        var awsSettings = {
                            "access_key": decryptedKeys[0],
                            "secret_key": decryptedKeys[1],
                            "region": cloudFormation.region,
                        };
                        var awsCF = new AWSCloudFormation(awsSettings);
                        awsCF.deleteStack(cloudFormation.stackId, function(err, deletedStack) {
                            if (err) {
                                logger.error("Unable to delete stack from aws", err);
                                res.send(500, {
                                    message: "Unable to delete stack from aws"
                                });
                                return;
                            }
                            configmgmtDao.getChefServerDetails(cloudFormation.infraManagerId, function(err, chefDetails) {
                                if (err) {
                                    logger.debug("Failed to fetch ChefServerDetails ", err);
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
                                instancesDao.getInstancesByCloudformationId(cloudFormation.id, function(err, instances) {
                                    if (err) {
                                        res.send(500, errorResponses.db.error);
                                        return;
                                    }
                                    var instanceIds = [];
                                    for (var i = 0; i < instances.length; i++) {
                                        instanceIds.push(instances[i].id);
                                        chef.deleteNode(instances[i].chef.chefNodeName, function(err, nodeData) {
                                            if (err) {
                                                logger.debug("Failed to delete node ", err);
                                                if (err.chefStatusCode && err.chefStatusCode === 404) {

                                                } else {

                                                }
                                                return;
                                            }
                                            logger.debug("Successfully removed instance from db.");
                                        });
                                    }

                                    instancesDao.removeInstancebyCloudFormationId(cloudFormation.id, function(err, deletedData) {
                                        if (err) {
                                            logger.error("Unable to delete stack instances from db", err);
                                            res.send(500, {
                                                message: "Unable to delete stack from aws"
                                            });
                                            return;
                                        }
                                        CloudFormation.removeById(cloudFormation.id, function(err, deletedStack) {
                                            if (err) {
                                                logger.error("Unable to delete stack from db", err);
                                                res.send(500, {
                                                    message: "Unable to delete stack from db"
                                                });
                                                return;
                                            }
                                            res.send(200, {
                                                message: "deleted",
                                                instanceIds: instanceIds
                                            });
                                        });
                                    });

                                });
                            });
                        });
                    });
                });
            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });

    app.get('/azure-arm/:cfId/instances', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                instancesDao.getInstancesByCloudformationId(cloudFormation.id, function(err, instances) {
                    if (err) {
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    res.send(200, instances);
                });
            } else {
                res.send(404, {
                    message: "stack not found"
                });
            }

        });
    });

    app.get('/azure-arm/:cfId/events', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                AWSProvider.getAWSProviderById(cloudFormation.cloudProviderId, function(err, aProvider) {
                    if (err) {
                        logger.error("Unable to fetch provider", err);
                        res.send(500, errorResponses.db.error);
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


                        var awsSettings = {
                            "access_key": decryptedKeys[0],
                            "secret_key": decryptedKeys[1],
                            "region": cloudFormation.region,
                        };
                        var awsCF = new AWSCloudFormation(awsSettings);
                        //var nextToken = req.query.nextToken;
                        awsCF.getAllStackEvents(cloudFormation.stackId, function(err, data) {

                            if (err) {
                                res.send(500, {
                                    message: "Failed to fetch stack events from aws"
                                });
                                return;
                            }
                            res.send(200, data);
                        });
                    });
                });
            } else {
                res.send(404, {
                    message: "stack not found"
                });
            }

        });
    });

    app.get('/azure-arm/:cfId/resources', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {

                AWSProvider.getAWSProviderById(cloudFormation.cloudProviderId, function(err, aProvider) {
                    if (err) {
                        logger.error("Unable to fetch provide", err);
                        res.send(500, errorResponses.db.error);
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

                        var awsSettings = {
                            "access_key": decryptedKeys[0],
                            "secret_key": decryptedKeys[1],
                            "region": cloudFormation.region,
                        };
                        var awsCF = new AWSCloudFormation(awsSettings);
                        awsCF.listAllStackResources(cloudFormation.stackId, function(err, resources) {
                            if (err) {
                                logger.error("Unable to fetch provide", err);
                                res.send(500, errorResponses.db.error);
                            }
                            res.send(200, resources);

                        });
                    });
                });

            }
        });

    });



};