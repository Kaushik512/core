/*
Copyright [2016] [Anshul Srivastava]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
var azureTemplateFunctionEvaluater = require('_pr/lib/azureTemplateFunctionEvaluater');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/azure-arm/*', sessionVerificationFunc);

    app.post('/azure-arm/evaluateVMs', function(req, res) {

        var parameters = req.body.parameters;
        var variables = req.body.variables;
        var vms = req.body.vms;

        var evaluatedVMS = [];

        for (var i = 0; i < vms.length; i++) {
            if (vms[i].copy) { // has copy
                var count = azureTemplateFunctionEvaluater.evaluate(vms[i].copy.count, parameters, variables);
                for (var j = 1; j <= count; j++) {
                    var vm = {};
                    var vmName = azureTemplateFunctionEvaluater.evaluate(vms[i].name, parameters, variables, j);
                    vm.name = vmName;
                    var properties = vms[i].properties;
                    if (properties && properties.osProfile) {
                        vm.username = azureTemplateFunctionEvaluater.evaluate(properties.osProfile.adminUsername, parameters, variables, j);
                        vm.password = azureTemplateFunctionEvaluater.evaluate(properties.osProfile.adminPassword, parameters, variables, j)
                    }
                    evaluatedVMS.push(vm);

                }

            } else {
                var vm = {};
                var vmName = azureTemplateFunctionEvaluater.evaluate(vms[i].name, parameters, variables);
                vm.name = vmName;
                var properties = vms[i].properties;
                if (properties && properties.osProfile) {
                    vm.username = azureTemplateFunctionEvaluater.evaluate(properties.osProfile.adminUsername, parameters, variables);
                    vm.password = azureTemplateFunctionEvaluater.evaluate(properties.osProfile.adminPassword, parameters, variables)
                }
                evaluatedVMS.push(vm);
            }
        }

        res.status(200).send(evaluatedVMS);
    });

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
                    arm.createResourceGroup(req.body.name, function(err, body) {
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
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (azureArm) {
                res.status(200).send(azureArm);

            } else {
                res.status(404).send({
                    message: "Not Found"
                });
            }
        });
    });


    app.get('/azure-arm/:armId/status', function(req, res) {
        AzureArm.getById(req.params.armId, function(err, azureArm) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (azureArm) {
                res.status(200).send({
                    status: azureArm.status
                });

            } else {
                res.status(404).send({
                    message: "Not Found"
                });
            }
        });
    });

    app.delete('/azure-arm/:armId', function(req, res) {

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

        AzureArm.getById(req.params.armId, function(err, azureArm) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (azureArm) {
                azureProvider.getAzureCloudProviderById(azureArm.cloudProviderId, function(err, providerdata) {
                    if (err) {
                        logger.error("Unable to fetch provider", err);
                        res.send(500, errorResponses.db.error);
                    }

                    providerdata = JSON.parse(providerdata);

                    var settings = appConfig;

                    var options = {
                        subscriptionId: providerdata.subscriptionId,
                    };

                    var arm = new ARM(options);
                    arm.deleteDeployedTemplate({
                        name: azureArm.deploymentName,
                        resourceGroup: azureArm.resourceGroup
                    }, function(err, body) {
                        if (err) {
                            res.status(500).send({
                                message: "Unable to delete stack from aws"
                            });
                            return;
                        }
                        configmgmtDao.getChefServerDetails(azureArm.infraManagerId, function(err, chefDetails) {
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
                            instancesDao.getInstancesByARMId(azureArm.id, function(err, instances) {
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

                                instancesDao.removeInstancebyArmId(azureArm.id, function(err, deletedData) {
                                    if (err) {
                                        logger.error("Unable to delete stack instances from db", err);
                                        res.send(500, {
                                            message: "Unable to delete stack from aws"
                                        });
                                        return;
                                    }
                                    AzureArm.removeById(azureArm.id, function(err, deletedStack) {
                                        if (err) {
                                            logger.error("Unable to delete stack from db", err);
                                            res.send(500, {
                                                message: "Unable to delete stack from db"
                                            });
                                            return;
                                        }
                                        res.status(200).send({
                                            message: "deleted",
                                            instanceIds: instanceIds
                                        });
                                    });
                                });

                            });
                        });

                    });

                });

            } else {
                res.status(404).send({
                    message: "Not Found"
                });
            }
        });

    });

    app.get('/azure-arm/:cfId/instances', function(req, res) {
        AzureArm.getById(req.params.cfId, function(err, azureArm) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (azureArm) {
                instancesDao.getInstancesByARMId(azureArm.id, function(err, instances) {
                    if (err) {
                        res.status(500).send(errorResponses.db.error);
                        return;
                    }
                    res.status(200).send(instances);
                });
            } else {
                res.status(404).send({
                    message: "not found"
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