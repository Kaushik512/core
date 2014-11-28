var masterjsonDao = require('../classes/d4dmasters/masterjson.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt.js');
var Chef = require('../classes/chef');
var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var tasksDao = require('../classes/tasks');
var logsDao = require('../classes/dao/logsdao.js');


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
                            var chef = new Chef({
                                userChefRepoLocation: chefDetails.chefRepoLocation,
                                chefUserName: chefDetails.loginname,
                                chefUserPemFile: chefDetails.userpemfile,
                                chefValidationPemFile: chefDetails.validatorpemfile,
                                hostedChefUrl: chefDetails.url,
                            });
                            console.log('instance IP ==>', instance.instanceIP);
                            var chefClientOptions = {
                                privateKey: instance.credentials.pemFileLocation,
                                username: instance.credentials.username,
                                host: instance.instanceIP,
                                instanceOS: instance.hardware.os,
                                port: 22,
                                runlist: task.runlist, // runing service runlist
                                updateRunlist: true
                            }
                            if (instance.credentials.pemFileLocation) {
                                chefClientOptions.privateKey = instance.credentials.pemFileLocation;
                            } else {
                                chefClientOptions.password = instance.credentials.password;
                            }
                            console.log('running chef client');
                            chef.runChefClient(chefClientOptions, function(err, retCode) {
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
                                        log: 'instance runlist updated',
                                        timestamp: new Date().getTime()
                                    });
                                } else {
                                    return;
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


                    })(instances[i]);
                }
                //setting last run timestamp
                tasksDao.updateLastRunTimeStamp(req.params.taskId,new Date().getTime(), function(err, data) {
                    if(err) {
                        console.log(err);
                    } 
                });

                res.send(instances);

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

};