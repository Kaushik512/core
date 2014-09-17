var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../classes/ec2.js');
var Chef = require('../classes/chef.js');
var taskstatusDao = require('../classes/taskstatus');
var logsDao = require('../classes/dao/logsdao.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/instances/*', sessionVerificationFunc);

    app.get('/instances/:instanceId', function(req, res) {
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            if (data.length) {
                res.send(data[0]);
            } else {
                res.send(404);
            }
        });
    })


    app.post('/instances/:instanceId/updateRunlist', function(req, res) {
        if (!req.body.runlist) {
            res.send(400);
            return;
        }
        console.log(req.body.runlist);
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            if (data.length) {
                settingsController.getSettings(function(settings) {
                    var chef = new Chef(settings.chef);

                    chef.runChefClient(req.body.runlist, {
                        privateKey: settings.aws.pemFileLocation + settings.aws.pemFile,
                        username: settings.aws.instanceUserName,
                        host: data[0].instanceIP,
                        port: 22
                    }, function(err, retCode) {
                        if (err) {
                            return;
                        }
                        console.log("knife ret code", retCode);
                        if (retCode == 0) {
                            console.log('updating node runlist in db');
                            instancesDao.updateInstancesRunlist(req.params.instanceId, req.body.runlist, function(err, updateCount) {
                                if (err) {
                                    return;
                                }
                                logsDao.insertLog({
                                    referenceId: req.params.instanceId,
                                    err: false,
                                    log: 'instance runlist updated',
                                    timestamp: new Date().getTime()
                                });
                            });
                        } else {
                            return;
                        }
                    }, function(stdOutData) {
                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: stdOutData.toString('ascii'),
                            timestamp: new Date().getTime()
                        });

                    }, function(stdOutErr) {
                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: true,
                            log: stdOutErr.toString('ascii'),
                            timestamp: new Date().getTime()
                        });
                    });
                    res.send(200);
                });
            } else {
                res.send(404);
            }
        });
    });

    app.get('/instances/:instanceId/stopInstance', function(req, res) {
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            if (data.length) {

                settingsController.getAwsSettings(function(settings) {
                    var ec2 = new EC2(settings);
                    ec2.stopInstance([data[0].platformId], function(err, stoppingInstances) {
                        if (err) {
                            res.send(500);
                            return;
                        }
                        res.send(200, {
                            instanceCurrentState: stoppingInstances[0].CurrentState.Name,
                        });

                        instancesDao.updateInstanceState(req.params.instanceId, stoppingInstances[0].CurrentState.Name, function(err, updateCount) {
                            if (err) {
                                console.log("update instance state err ==>", err);
                                return;
                            }
                            console.log('instance state upadated');
                        });

                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: "Instance Stopping",
                            timestamp: new Date().getTime()
                        }, function(err, data) {
                            if (err) {
                                console.log('unable to update bootStrapLog');
                                return;
                            }
                            console.log('bootStrapLog updated');
                        });


                    }, function(err, state) {
                        if (err) {
                            return;
                        }
                        instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
                            if (err) {
                                console.log("update instance state err ==>", err);
                                return;
                            }
                            console.log('instance state upadated');
                        });


                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: "Instance Stopped",
                            timestamp: new Date().getTime()
                        }, function(err, data) {
                            if (err) {
                                console.log('unable to update log');
                                return;
                            }
                            console.log('log updated');
                        });


                    });


                });
            } else {
                res.send(404);
                return;
            }
        });
    });

    app.get('/instances/:instanceId/startInstance', function(req, res) {
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            if (data.length) {

                settingsController.getAwsSettings(function(settings) {
                    var ec2 = new EC2(settings);
                    ec2.startInstance([data[0].platformId], function(err, startingInstances) {
                        if (err) {
                            res.send(500);
                            return;
                        }
                        res.send(200, {
                            instanceCurrentState: startingInstances[0].CurrentState.Name,
                        });

                        instancesDao.updateInstanceState(req.params.instanceId, startingInstances[0].CurrentState.Name, function(err, updateCount) {
                            if (err) {
                                console.log("update instance state err ==>", err);
                                return;
                            }
                            console.log('instance state upadated');
                        });


                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: "Instance Starting",
                            timestamp: new Date().getTime()
                        });

                    }, function(err, state) {
                        if (err) {
                            return;
                        }
                        instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
                            if (err) {
                                console.log("update instance state err ==>", err);
                                return;
                            }
                            console.log('instance state upadated');
                        });

                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: "Instance Started",
                            timestamp: new Date().getTime()
                        });

                        ec2.describeInstances([data[0].platformId], function(err, data) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            if (data.Reservations.length && data.Reservations[0].Instances.length) {
                                console.info("ip =>", data.Reservations[0].Instances[0].PublicIpAddress);
                                instancesDao.updateInstanceIp(req.params.instanceId, data.Reservations[0].Instances[0].PublicIpAddress, function(err, updateCount) {
                                    if (err) {
                                        console.log("update instance ip err ==>", err);
                                        return;
                                    }
                                    console.log('instance ip upadated');
                                });
                            }
                        });
                    });

                });

            } else {
                res.send(404);
                return;
            }
        });

    });


    app.get('/instances/:instanceId/logs', function(req, res) {
        var timestamp = req.query.timestamp;
        logsDao.getLogsByReferenceId(req.params.instanceId, timestamp, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);

        });

    });



};