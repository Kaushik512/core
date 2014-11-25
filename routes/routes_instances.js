var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../classes/ec2.js');
var Chef = require('../classes/chef.js');
var taskstatusDao = require('../classes/taskstatus');
var logsDao = require('../classes/dao/logsdao.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt');
var Docker = require('../classes/docker.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/instances/*', sessionVerificationFunc);


    app.get('/instances', function(req, res) {
        instancesDao.getInstances(function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }

            res.send(data);

        });
    });

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
    });

    app.get('/instances/dockerimagepull/:instanceid', function(req, res) {

        console.log('reached here a');

        var _docker = new Docker();
        var stdmessages = '';
        _docker.runDockerCommands('sudo docker pull centos', req.params.instanceid,
            function(err, retCode) {
                if (err) {
                    logsDao.insertLog({
                        referenceId: req.params.instanceId,
                        err: true,
                        log: 'Unable to run chef-client',
                        timestamp: new Date().getTime()
                    });
                    res.send(err);
                    return;
                }

                console.log("docker return ", retCode);
                res.send(200);

            },
            function(stdOutData) {
                if (!stdOutData) {
                    logsDao.insertLog({
                        referenceId: req.params.instanceId,
                        err: false,
                        log: stdOutData.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                    stdmessages += stdOutData.toString('ascii');
                }
            }, function(stdOutErr) {
                logsDao.insertLog({
                    referenceId: req.params.instanceId,
                    err: true,
                    log: stdOutErr.toString('ascii'),
                    timestamp: new Date().getTime()
                });
                console.log("docker return ", stdOutErr);
                res.send(stdOutErr);

            });

    });


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
                var instance = data[0];
                configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(500);
                        return;
                    }
                    var chef = new Chef({
                        userChefRepoLocation: chefDetails.chefRepoLocation,
                        chefUserName: chefDetails.loginname,
                        chefUserPemFile: chefDetails.userpemfile,
                        chefValidationPemFile: chefDetails.validatorpemfile,
                        hostedChefUrl: chefDetails.url,
                    });


                    settingsController.getSettings(function(settings) {

                        var chefClientOptions = {
                            privateKey: instance.credentials.pemFileLocation,
                            username: instance.credentials.username,
                            host: instance.instanceIP,
                            instanceOS: instance.hardware.os,
                            port: 22,
                            runlist: req.body.runlist
                        }
                        if (instance.credentials.pemFileLocation) {
                            chefClientOptions.privateKey = instance.credentials.pemFileLocation;
                        } else {
                            chefClientOptions.password = instance.credentials.password;
                        }
                        chef.runChefClient(chefClientOptions, function(err, retCode) {
                            if (err) {
                                logsDao.insertLog({
                                    referenceId: req.params.instanceId,
                                    err: true,
                                    log: 'Unable to run chef-client',
                                    timestamp: new Date().getTime()
                                });
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

                logsDao.insertLog({
                    referenceId: req.params.instanceId,
                    err: false,
                    log: "Instance Stopping",
                    timestamp: new Date().getTime()
                });

                settingsController.getAwsSettings(function(settings) {
                    var ec2 = new EC2(settings);
                    ec2.stopInstance([data[0].platformId], function(err, stoppingInstances) {
                        if (err) {
                            logsDao.insertLog({
                                referenceId: req.params.instanceId,
                                err: true,
                                log: "Unable to stop instance",
                                timestamp: new Date().getTime()
                            });
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

                logsDao.insertLog({
                    referenceId: req.params.instanceId,
                    err: false,
                    log: "Instance Starting",
                    timestamp: new Date().getTime()
                });

                settingsController.getAwsSettings(function(settings) {
                    var ec2 = new EC2(settings);
                    ec2.startInstance([data[0].platformId], function(err, startingInstances) {
                        if (err) {

                            logsDao.insertLog({
                                referenceId: req.params.instanceId,
                                err: true,
                                log: "Unable to start instance",
                                timestamp: new Date().getTime()
                            });
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
        if (timestamp) {
            timestamp = parseInt(timestamp);
        }
        logsDao.getLogsByReferenceId(req.params.instanceId, timestamp, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);

        });

    });




    app.post('/instances/:instanceId/services/create', function(req, res) {
        console.log(req.body);
        instancesDao.createService(req.params.instanceId, req.body.serviceData, function(err, service) {
            if (err) {
                console.log(err)
                res.send(500);
                return;
            }
            console.log(service);
            res.send(200, service);
        });
    });

    app.delete('/instances/:instanceId/services/:serviceId', function(req, res) {
        instancesDao.deleteService(req.params.instanceId, req.params.serviceId, function(err, deleteCount) {
            if (err) {
                console.log(err)
                res.send(500);
                return;
            }
            console.log(deleteCount);
            if (deleteCount) {
                res.send({
                    deleteCount: deleteCount
                }, 200);
            } else {
                res.send(400);
            }

        });


    });

    app.post('/instances/:instanceId/services/:serviceId/actions/create', function(req, res) {
        console.log(req.body);
        instancesDao.createServiceAction(req.params.instanceId, req.params.serviceId, req.body.actionData, function(err, action) {
            if (err) {
                console.log(err)
                res.send(500);
                return;
            }
            console.log(action);
            res.send(200, action);
        });
    });

    app.get('/instances/:instanceId/services/:serviceId/actions/:actionId/execute', function(req, res) {
        console.log(req.body);

        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }
            if (!data.length) {
                res.send(400);
                return;
            }
            data = data[0];
            if (data && data.services && data.services.length) {
                var action;
                for (var i = 0; i < data.services.length; i++) {
                    var service = data.services[i];
                    if (service._id == req.params.serviceId) {
                        if (service.actions && service.actions.length) {
                            for (j = 0; j < service.actions.length; j++) {
                                if (service.actions[j]._id == req.params.actionId) {
                                    action = service.actions[j];
                                    break;
                                }
                            }
                        }
                    }
                    if (action) {
                        break;
                    }
                }

                if (!action) {
                    res.send(400);
                    return;
                }
                var instance = data;

                configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(500);
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
                        runlist: action.serviceRunlist, // runing service runlist
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
                                referenceId: req.params.instanceId,
                                err: true,
                                log: 'Unable to run chef-client',
                                timestamp: new Date().getTime()
                            });
                            return;
                        }
                        console.log("knife ret code", retCode);
                        if (retCode == 0) {
                            logsDao.insertLog({
                                referenceId: req.params.instanceId,
                                err: false,
                                log: 'instance runlist updated',
                                timestamp: new Date().getTime()
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
                res.send(400);
            }
        });
    });





    app.get('/instances/:instanceId/bootstrap', function(req, res) {
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            if (data.length) {
                var instance = data[0];
                configmgmtDao.getChefServerDetails(data[0].chef.serverId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(500);
                        return;
                    }
                    var chef = new Chef({
                        userChefRepoLocation: chefDetails.chefRepoLocation,
                        chefUserName: chefDetails.loginname,
                        chefUserPemFile: chefDetails.userpemfile,
                        chefValidationPemFile: chefDetails.validatorpemfile,
                        hostedChefUrl: chefDetails.url,
                    });

                    chef.bootstrapInstance({
                        instanceIp: instance.instanceIP,
                        pemFilePath: instance.credentials.pemFileLocation,
                        runlist: instance.runlist,
                        instanceUsername: instance.credentials.username,
                        nodeName: instance.chef.chefNodeName,
                        environment: instance.envId,
                        instanceOS: instance.hardware.os
                    }, function(err, code) {

                        console.log('process stopped ==> ', err, code);
                        if (err) {
                            console.log("knife launch err ==>", err);
                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                            });
                        } else {
                            if (code == 0) {
                                instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                    if (err) {
                                        console.log("Unable to set instance bootstarp status");
                                    } else {
                                        console.log("Instance bootstrap status set to success");
                                    }
                                });

                                chef.getNode(instance.chefNodeName, function(err, nodeData) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    var hardwareData = {};
                                    hardwareData.architecture = nodeData.automatic.kernel.machine;
                                    hardwareData.platform = nodeData.automatic.platform;
                                    hardwareData.platformVersion = nodeData.automatic.platform_version;
                                    hardwareData.memory = {};
                                    hardwareData.memory.total = nodeData.automatic.memory.total;
                                    hardwareData.memory.free = nodeData.automatic.memory.free;
                                    hardwareData.os = instance.hardware.os;
                                    instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                        if (err) {
                                            console.log("Unable to set instance hardware details");
                                        } else {
                                            console.log("Instance hardware details set successessfully");
                                        }
                                    });
                                });

                            } else {
                                instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                    if (err) {
                                        console.log("Unable to set instance bootstarp status");
                                    } else {
                                        console.log("Instance bootstrap status set to failed");
                                    }
                                });

                            }
                        }

                    }, function(stdOutData) {

                        logsDao.insertLog({
                            referenceId: instance.id,
                            err: false,
                            log: stdOutData.toString('ascii'),
                            timestamp: new Date().getTime()
                        }, function(err, data) {
                            if (err) {
                                console.log('unable to update bootStrapLog');
                                return;
                            }
                            console.log('bootStrapLog updated');
                        });

                    }, function(stdErrData) {

                        logsDao.insertLog({
                            referenceId: instance.id,
                            err: true,
                            log: stdErrData.toString('ascii'),
                            timestamp: new Date().getTime()
                        }, function(err, data) {
                            if (err) {
                                console.log('unable to update bootStrapLog');
                                return;
                            }
                            console.log('bootStrapLog updated');
                        });


                    });
                    res.send(200);
                });

            } else {
                res.send(404);
            }
        });

    });



};