var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/dao/instancesdao');
var tasksDao = require('../model/dao/orchestrationdao');
var logsDao = require('../model/dao/logsdao.js');
var credentialCryptography = require('../lib/credentialcryptography')
var fileIo = require('../lib/utils/fileio');

var Jenkins = require('../lib/jenkins');

var errorResponses = require('./error_responses.js')


module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/tasks/*', sessionVerification);

    app.get('/tasks/:taskId/run', function(req, res) {
        tasksDao.getTaskById(req.params.taskId, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500,errorResponses.db.error);
                return;
            }
            if (!data.length) {
                res.send(400);
                return;
            }

            var task = data[0];
            if (task.taskType === 'chef') {
                var instanceIds = task.chefTask.nodesIdList;
                console.log(task.nodesIdList);
                if (!(instanceIds && instanceIds.length)) {
                    res.send(500, errorResponses.db.error);
                    return;
                }

                console.log(instanceIds);

                instancesDao.getInstances(instanceIds, function(err, instances) {
                    if (err) {
                        console.log(err);
                        res.send(500, errorResponses.db.error);
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
                                        runlist: task.chefTask.runlist, // runing service runlist
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
                        instances: instances,
                        taskType: 'chef'
                    });

                });
            } else {
                var jenkinsTask = task.jenkinsTask;
                configmgmtDao.getJenkinsDataFromId(jenkinsTask.jenkinsServerId, function(err, jenkinsData) {
                    if (err) {
                        logger.error('jenkins list fetch error', err);
                        res.send(500, errorResponses.db.error);
                        return;
                    } else {
                        if (!(jenkinsData && jenkinsData.length)) {
                            res.send(404, errorResponses.jenkins.notFound);
                        }
                        jenkinsData = jenkinsData[0];
                        var jenkins = new Jenkins({
                            url: jenkinsData.jenkinsurl,
                            username: jenkinsData.jenkinsusername,
                            password: jenkinsData.jenkinspassword
                        });
                        jenkins.getJobInfo(jenkinsTask.jobName, function(err, jobInfo) {
                            if (err) {
                                logger.error(err);
                                res.send(500, errorResponses.jenkins.serverError);
                                return;
                            }
                            // running the job
                            if (!jobInfo.inQueue) {
                                jenkins.buildJob(jenkinsTask.jobName, function(err, buildRes) {
                                    if (err) {
                                        logger.error(err);
                                        res.send(500, errorResponses.jenkins.serverError);
                                        return;
                                    }
                                    console.log('buildRes ==> ', buildRes);
                                    var taskRunTimestamp = new Date().getTime();
                                    tasksDao.updateLastRunTimeStamp(req.params.taskId, new Date().getTime(), function(err, data) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });

                                    res.send({
                                        timestamp: taskRunTimestamp,
                                        lastBuildNumber: jobInfo.lastBuild.number,
                                        nextBuildNumber: jobInfo.nextBuildNumber,
                                        taskType: 'jenkins',
                                        jenkinsServerId: jenkinsTask.jenkinsServerId,
                                        jobName: jenkinsTask.jobName,
                                    });
                                });
                            } else {
                                res.send(500, errorResponses.jenkins.buildInQueue);
                            }
                        });
                    }
                });
            }

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