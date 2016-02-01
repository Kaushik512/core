/*
Copyright [2016] [Gobinda Das]

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

var intanceDao = require('../instance/instance');
var instancesDao = require('../instance/instance');
var logsDao = require('../../dao/logsdao.js');
var credentialCryptography = require('../../../lib/credentialcryptography')
var fileIo = require('../../../lib/utils/fileio');
var configmgmtDao = require('../../d4dmasters/configmgmt.js');

var Chef = require('../../../lib/chef');

var taskTypeSchema = require('./taskTypeSchema');

var ChefClientExecution = require('../instance/chefClientExecution/chefClientExecution.js');
var utils = require('../utils/utils.js');

var chefTaskSchema = taskTypeSchema.extend({
    nodeIds: [String],
    runlist: [String],
    attributes: [{
        name: String,
        jsonObj: {}
    }]
});

//Instance Methods :- getNodes
chefTaskSchema.methods.getNodes = function() {
    return this.nodeIds;

};

// Instance Method :- run task
chefTaskSchema.methods.execute = function(userName, baseUrl, choiceParam, nexusData, onExecute, onComplete) {
    var self = this;
    logger.debug("self: ", JSON.stringify(self));
    //merging attributes Objects
    var attributeObj = {};
    var objectArray = [];
    for (var i = 0; i < self.attributes.length; i++) {
        objectArray.push(self.attributes[i].jsonObj);
    }
    // While passing extra attribute to chef cookbook "rlcatalyst" is used as attribute.
    if (nexusData) {
        objectArray.push({
            "rlcatalyst": {
                "nexusUrl": nexusData.nexusUrl
            }
        });
        objectArray.push({
            "rlcatalyst": {
                "version": nexusData.version
            }
        });
        if (nexusData.containerId) {
            objectArray.push({
                "rlcatalyst": {
                    "containerId": nexusData.containerId
                }
            });
        }
        if (nexusData.containerPort) {
            objectArray.push({
                "rlcatalyst": {
                    "containerPort": nexusData.containerPort
                }
            });
        }
        if (nexusData.containerPort) {
            objectArray.push({
                "rlcatalyst": {
                    "dockerRepo": nexusData.dockerRepo
                }
            });
        }

        if (nexusData.upgrade) {
            objectArray.push({
                "rlcatalyst": {
                    "upgrade": nexusData.upgrade
                }
            });
        }

        if (nexusData.projectId) {
            objectArray.push({
                "rlcatalyst": {
                    "projectId": nexusData.projectId
                }
            });
        }
    }
    logger.debug("AppDeploy attributes: ",JSON.stringify(objectArray));
    var attributeObj = utils.mergeObjects(objectArray);
    var instanceIds = this.nodeIds;
    if (!(instanceIds && instanceIds.length)) {
        if (typeof onExecute === 'function') {
            onExecute({
                message: "Empty Node List"
            }, null);
        }
        return;
    }
    
    instancesDao.getInstances(instanceIds, function(err, instances) {
        if (err) {
            logger.error(err);
            if (typeof onExecute === 'function') {
                onExecute(err, null);
            }
            return;
        }


        var count = 0;
        var overallStatus = 0;
        var instanceResultList = [];
        var executionIds = [];

        function instanceOnCompleteHandler(err, status, instanceId, executionId, actionId) {
            logger.debug('Instance onComplete fired', count, instances.length);
            count++;
            var result = {
                instanceId: instanceId,
                status: 'success'
            }
            if (actionId) {
                result.actionId = actionId;
            }
            if (executionId) {
                result.executionId = executionId;
            }
            if (err) {
                result.status = 'failed';
                overallStatus = 1;
            } else {
                if (status === 0) {
                    result.status = 'success';
                } else {
                    result.status = 'failed';
                    overallStatus = 1;
                }
            }
            instanceResultList.push(result);
            if (!(count < instances.length)) {
                logger.debug('Type of onComplete: ' + typeof onComplete);
                if (typeof onComplete === 'function') {
                    onComplete(null, overallStatus, {
                        instancesResults: instanceResultList
                    });
                }
            }
        }
        for (var i = 0; i < instances.length; i++) {
            (function(instance) {
                var timestampStarted = new Date().getTime();

                var actionLog = instancesDao.insertOrchestrationActionLog(instance._id, self.runlist, userName, timestampStarted);
                instance.tempActionLogId = actionLog._id;


                var logsReferenceIds = [instance._id, actionLog._id];
                if (!instance.instanceIP) {
                    var timestampEnded = new Date().getTime();
                    logsDao.insertLog({
                        referenceId: logsReferenceIds,
                        err: true,
                        log: "Instance IP is not defined. Chef Client run failed",
                        timestamp: timestampEnded
                    });
                    instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                    instanceOnCompleteHandler({
                        message: "Instance IP is not defined. Chef Client run failed"
                    }, 1, instance._id, null, actionLog._id);
                    return;
                }
                configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                    if (err) {
                        var timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logsReferenceIds,
                            err: true,
                            log: "Chef Data Corrupted. Chef Client run failed",
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                        instanceOnCompleteHandler(err, 1, instance._id, null, actionLog._id);
                        return;
                    }
                    if (!chefDetails) {
                        var timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logsReferenceIds,
                            err: true,
                            log: "Chef Data Corrupted. Chef Client run failed",
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                        instanceOnCompleteHandler({
                            message: "Chef Data Corrupted. Chef Client run failed"
                        }, 1, instance._id, null, actionLog._id);
                        return;
                    }
                    //decrypting pem file
                    credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                        if (err) {
                            var timestampEnded = new Date().getTime();
                            logsDao.insertLog({
                                referenceId: logsReferenceIds,
                                err: true,
                                log: "Unable to decrypt pem file. Chef run failed",
                                timestamp: timestampEnded
                            });
                            instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                            instanceOnCompleteHandler(err, 1, instance._id, null, actionLog._id);
                            return;
                        }

                        ChefClientExecution.createNew({
                            instanceId: instance._id

                        }, function(err, chefClientExecution) {
                            if (err) {
                                var timestampEnded = new Date().getTime();
                                logsDao.insertLog({
                                    referenceId: logsReferenceIds,
                                    err: true,
                                    log: "Unable to generate chef run execution id. Chef run failed",
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                                instanceOnCompleteHandler(err, 1, instance._id, null, actionLog._id);
                                return;
                            }

                            var executionIdJsonAttributeObj = {
                                catalyst_attribute_handler: {
                                    catalystCallbackUrl: baseUrl + '/chefClientExecution/' + chefClientExecution.id
                                }
                            };

                            var jsonAttributeObj = utils.mergeObjects([executionIdJsonAttributeObj, attributeObj]);
                            var jsonAttributesString = JSON.stringify(jsonAttributeObj);

                            var chef = new Chef({
                                userChefRepoLocation: chefDetails.chefRepoLocation,
                                chefUserName: chefDetails.loginname,
                                chefUserPemFile: chefDetails.userpemfile,
                                chefValidationPemFile: chefDetails.validatorpemfile,
                                hostedChefUrl: chefDetails.url,
                            });

                            var chefClientOptions = {
                                privateKey: decryptedCredentials.pemFileLocation,
                                username: decryptedCredentials.username,
                                host: instance.instanceIP,
                                instanceOS: instance.hardware.os,
                                port: 22,
                                runlist: self.runlist, // runing service runlist
                                jsonAttributes: jsonAttributesString,
                                overrideRunlist: true,
                                parallel: true
                            }
                            if (decryptedCredentials.pemFileLocation) {
                                chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                            } else {
                                chefClientOptions.password = decryptedCredentials.password;
                            }
                            logsDao.insertLog({
                                referenceId: logsReferenceIds,
                                err: false,
                                log: "Executing Task",
                                timestamp: new Date().getTime()
                            });
                            chef.runChefClient(chefClientOptions, function(err, retCode) {
                                if (decryptedCredentials.pemFileLocation) {
                                    fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                        if (err) {
                                            logger.error("Unable to delete temp pem file =>", err);
                                        } else {
                                            logger.debug("temp pem file deleted");
                                        }
                                    });
                                }
                                if (err) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logsReferenceIds,
                                        err: true,
                                        log: 'Unable to run chef-client',
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                                    instanceOnCompleteHandler(err, 1, instance._id, chefClientExecution.id, actionLog._id);
                                    return;
                                }
                                if (retCode == 0) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logsReferenceIds,
                                        err: false,
                                        log: 'Task execution success',
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(instance._id, actionLog._id, true, timestampEnded);
                                    instanceOnCompleteHandler(null, 0, instance._id, chefClientExecution.id, actionLog._id);
                                } else {
                                    instanceOnCompleteHandler(null, retCode, instance._id, chefClientExecution.id, actionLog._id);
                                    if (retCode === -5000) {
                                        logsDao.insertLog({
                                            referenceId: logsReferenceIds,
                                            err: true,
                                            log: 'Host Unreachable',
                                            timestamp: new Date().getTime()
                                        });
                                    } else if (retCode === -5001) {
                                        logsDao.insertLog({
                                            referenceId: logsReferenceIds,
                                            err: true,
                                            log: 'Invalid credentials',
                                            timestamp: new Date().getTime()
                                        });
                                    } else {
                                        logsDao.insertLog({
                                            referenceId: logsReferenceIds,
                                            err: true,
                                            log: 'Unknown error occured. ret code = ' + retCode,
                                            timestamp: new Date().getTime()
                                        });
                                    }
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logsReferenceIds,
                                        err: true,
                                        log: 'Error in running chef-client',
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                                }
                            }, function(stdOutData) {
                                logsDao.insertLog({
                                    referenceId: logsReferenceIds,
                                    err: false,
                                    log: stdOutData.toString('ascii'),
                                    timestamp: new Date().getTime()
                                });
                            }, function(stdOutErr) {
                                logsDao.insertLog({
                                    referenceId: logsReferenceIds,
                                    err: true,
                                    log: stdOutErr.toString('ascii'),
                                    timestamp: new Date().getTime()
                                });
                            });
                        });
                    });

                });


            })(instances[i]);
        }

        if (typeof onExecute === 'function') {
            onExecute(null, {
                instances: instances,
            });
        }
    });
};

var ChefTask = mongoose.model('chefTask', chefTaskSchema);

module.exports = ChefTask;
