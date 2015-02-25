var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/dao/instancesdao');
var tasksDao = require('../model/tasks');
var logsDao = require('../model/dao/logsdao.js');
var credentialCryptography = require('../lib/credentialcryptography')
var fileIo = require('../lib/utils/fileio');


module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/tasks/*', sessionVerification);

    app.get('/tasks/:taskId/run', function(req, res) {
        tasksDao.getTaskById(req.params.taskId, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }
            if (!data.length) {
                res.send(400);
                return;
            }

            var task = data[0];
            var instanceIds = task.nodesIdList;
            console.log(task.nodesIdList);
            if (!(instanceIds && instanceIds.length)) {
                console.log(task.nodesIdList);
                res.send(500);
                return;
            }

            console.log(instanceIds);

            instancesDao.getInstances(instanceIds, function(err, instances) {
                if (err) {
                    console.log(err);
                    res.send(500);
                    return;
                }

                for (var i = 0; i < instances.length; i++) {
                    (function(instance) {
                        var timestampStarted = new Date().getTime();

                        var actionLog = instancesDao.insertOrchestrationActionLog(instance._id, task.runlist, req.session.user.cn, timestampStarted);
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
                                    runlist: task.runlist, // runing service runlist
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
                //setting last run timestamp
                var taskRunTimestamp = new Date().getTime();
                tasksDao.updateLastRunTimeStamp(req.params.taskId, new Date().getTime(), function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                });

                res.send({
                    timestamp: taskRunTimestamp,
                    instances: instances
                });

            });





        });
    });

    app.delete('/tasks/:taskId', function(req, res) {
        tasksDao.removeTaskById(req.params.taskId, function(err, deleteCount) {
            if (err) {
                res.send(500);
                return;
            }
            if (deleteCount) {
                res.send({
                    deleteCount: deleteCount
                });
            } else {
                res.send(400);
            }
        });
    });

    app.get('/tasks/:taskId', function(req, res) {
        tasksDao.getTaskById(req.params.taskId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            console.log('task data');
            if (data && data.length) {
                res.send(data[0]);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/tasks/:taskId/update', function(req, res) {
        var taskData = req.body.taskData;
        if (!taskData.runlist || !taskData.runlist.length) {
            res.send(400);
        }
        if (!taskData.nodesIdList || !taskData.nodesIdList.length) {
            res.send(400);
        }
        tasksDao.updateTaskData(req.params.taskId, taskData, function(err, updateCount) {
            if (err) {
                res.send(500);
                return;
            }
            if (updateCount) {
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

};