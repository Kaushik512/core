var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var intanceDao = require('../../dao/instancesdao');
var instancesDao = require('../../dao/instancesdao');
var logsDao = require('../../dao/logsdao.js');
var credentialCryptography = require('../../../lib/credentialcryptography')
var fileIo = require('../../../lib/utils/fileio');
var configmgmtDao = require('../../d4dmasters/configmgmt.js');

var Chef = require('../../../lib/chef');

var taskTypeSchema = require('./taskTypeSchema');


var chefTaskSchema = taskTypeSchema.extend({
    nodeIds: [String],
    runlist: [String],
    attributesjson: {}
});

//Instance Methods :- getNodes
chefTaskSchema.methods.getNodes = function() {
    return this.nodeIds;

};

// Instance Method :- run task
chefTaskSchema.methods.execute = function(userName, onExecute, onComplete) {
    var self = this;
    //self.attributesjson = JSON.stringify(self.attributesjson);
    var parsedAttrJson = JSON.stringify(self.attributesjson);
    if(parsedAttrJson == '\"\"'){
        parsedAttrJson = '';
    }
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
            console.log(err);
            if (typeof onExecute === 'function') {
                onExecute(err, null);
            }
            return;
        }
        if (typeof onExecute === 'function') {
            onExecute(null, {
                instances: instances,
            });
        }

        var count = 0;
        var overallStatus = 0;
        var instanceResultList = [];

        function instanceOnCompleteHandler(err, status, instanceId) {
            logger.debug('Instance onComplete fired', count, instances.length);
            count++;
            var result = {
                instanceId: instanceId,
                status: 'success'
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
                if (typeof onComplete === 'function') {
                    onComplete(null, overallStatus);
                }
            }
        }
        for (var i = 0; i < instances.length; i++) {
            (function(instance) {
                var timestampStarted = new Date().getTime();

                var actionLog = instancesDao.insertOrchestrationActionLog(instance._id, self.runlist, userName, timestampStarted);
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
                    }, 1, instance._id);
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
                        instanceOnCompleteHandler(err, 1, instance._id);
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
                        }, 1, instance._id);
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
                            instanceOnCompleteHandler(err, 1, instance._id);
                            return;
                        }
                        var chef = new Chef({
                            userChefRepoLocation: chefDetails.chefRepoLocation,
                            chefUserName: chefDetails.loginname,
                            chefUserPemFile: chefDetails.userpemfile,
                            chefValidationPemFile: chefDetails.validatorpemfile,
                            hostedChefUrl: chefDetails.url,
                        });
                        console.log('instance IP ==>', instance.instanceIP);
                       // if(self.attributesjson.toString().indexOf('"\\') <= 0)
                           // self.attributesjson = JSON.stringify(self.attributesjson);
                        
                        
                        console.log('>>>>> Task Config : ' + parsedAttrJson);
                        var chefClientOptions = {
                            privateKey: decryptedCredentials.pemFileLocation,
                            username: decryptedCredentials.username,
                            host: instance.instanceIP,
                            instanceOS: instance.hardware.os,
                            port: 22,
                            runlist: self.runlist, // runing service runlist
                            jsonAttributes: parsedAttrJson,
                            overrideRunlist: true
                        }
                        if (decryptedCredentials.pemFileLocation) {
                            chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                        } else {
                            chefClientOptions.password = decryptedCredentials.password;
                        }
                        console.log('running chef client');
                        console.log('>>>>chefClientOptions:' + JSON.stringify(chefClientOptions));
                        chef.runChefClient(chefClientOptions, function(err, retCode) {
                            if (decryptedCredentials.pemFileLocation) {
                                fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                    if (err) {
                                        console.log("Unable to delete temp pem file =>", err);
                                    } else {
                                        console.log("temp pem file deleted =>", err);
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
                                instanceOnCompleteHandler(err, 1, instance._id);
                                return;
                            }
                            console.log("knife ret code", retCode);
                            if (retCode == 0) {
                                var timestampEnded = new Date().getTime();
                                logsDao.insertLog({
                                    referenceId: logsReferenceIds,
                                    err: false,
                                    log: 'Task execution success',
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(instance._id, actionLog._id, true, timestampEnded);
                                instanceOnCompleteHandler(null, 0, instance._id);
                            } else {
                                instanceOnCompleteHandler(null, retCode, instance._id);
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


            })(instances[i]);
        }
    });
};

var ChefTask = mongoose.model('chefTask', chefTaskSchema);

module.exports = ChefTask;