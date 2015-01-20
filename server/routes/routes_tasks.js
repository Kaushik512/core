var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/blueprints');

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
                        if (!instance.instanceIP) {
                            return;
                        }
                        configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                            if (err) {
                                return;
                            }
                            if (!chefDetails) {
                                return;
                            }
                            //decrypting pem file
                            credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                                if (err) {
                                    logsDao.insertLog({
                                        referenceId: instance.id,
                                        err: true,
                                        log: "Unable to decrypt pem file. Chef run failed",
                                        timestamp: new Date().getTime()
                                    });
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
                                        logsDao.insertLog({
                                            referenceId: instance._id,
                                            err: true,
                                            log: 'Unable to run chef-client',
                                            timestamp: new Date().getTime()
                                        });
                                        return;
                                    }
                                    console.log("knife ret code", retCode);
                                    if (retCode == 0) {
                                        logsDao.insertLog({
                                            referenceId: instance._id,
                                            err: false,
                                            log: 'Task execution success',
                                            timestamp: new Date().getTime()
                                        });
                                    } else {
                                        logsDao.insertLog({
                                            referenceId: instance._id,
                                            err: false,
                                            log: 'Error in running chef-client',
                                            timestamp: new Date().getTime()
                                        });
                                    }
                                }, function(stdOutData) {
                                    logsDao.insertLog({
                                        referenceId: instance._id,
                                        err: false,
                                        log: stdOutData.toString('ascii'),
                                        timestamp: new Date().getTime()
                                    });

                                }, function(stdOutErr) {
                                    logsDao.insertLog({
                                        referenceId: instance._id,
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
                    timestamp:taskRunTimestamp,
                    instances:instances
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