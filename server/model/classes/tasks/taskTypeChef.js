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
    runlist: [String]
});

//Instance Methods :- getNodes
chefTaskSchema.methods.getNodes = function() {
    return this.nodeIds;

};

// Instance Method :- run task
chefTaskSchema.methods.execute = function(userName,onExecute) {
    var self = this;
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
                        var chefClientOptions = {
                            privateKey: decryptedCredentials.pemFileLocation,
                            username: decryptedCredentials.username,
                            host: instance.instanceIP,
                            instanceOS: instance.hardware.os,
                            port: 22,
                            runlist: self.runlist, // runing service runlist
                            overrideRunlist: true
                        }
                        if (decryptedCredentials.pemFileLocation) {
                            chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                        } else {
                            chefClientOptions.password = decryptedCredentials.password;
                        }
                        console.log('running chef client');
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
                            } else {
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