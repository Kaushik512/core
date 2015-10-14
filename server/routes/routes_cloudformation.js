var CloudFormation = require('_pr/model/cloud-formation');
var errorResponses = require('./error_responses');
var AWSCloudFormation = require('_pr/lib/awsCloudFormation');
var appConfig = require('_pr/config');
var Cryptography = require('_pr/lib/utils/cryptography');
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var logger = require('_pr/logger')(module);
var instancesDao = require('_pr/model/classes/instance/instance');
var configmgmtDao = require('_pr/model/d4dmasters/configmgmt');
var Chef = require('../lib/chef.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/cloudformation/*', sessionVerificationFunc);

    app.get('/cloudformation/:cfId', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                res.send(200, cloudFormation);

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });

    app.get('/cloudformation/:cfId/status', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                res.send(200, {
                    status: cloudFormation.status
                });

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });

    app.delete('/cloudformation/:cfId', function(req, res) {

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

    app.get('/cloudformation/:cfId/instances', function(req, res) {
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

    app.get('/cloudformation/:cfId/events', function(req, res) {
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

    app.get('/cloudformation/:cfId/resources', function(req, res) {
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
                            res.send(200,resources);

                        });
                    });
                });

            }
        });

    });




};