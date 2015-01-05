var blueprintsDao = require('../model/blueprints');
var settingsController = require('../model/settings');
var instancesDao = require('../model/instances');
var EC2 = require('../lib/ec2.js');
var Chef = require('../lib/chef.js');
var taskstatusDao = require('../model/taskstatus');
var logsDao = require('../model/dao/logsdao.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var Docker = require('../model/docker.js');
var SSH = require('../lib/utils/sshexec');
var appConfig = require('../config/app_config.js');
var credentialCryptography = require('../lib/credentialcryptography')
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var javaSSHWrapper = require('../model/javaSSHWrapper.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/instances/*', sessionVerificationFunc);


    app.get('/instances', function(req, res) {
        instancesDao.getInstances(null, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }

            res.send(data);

        });
    });

    app.post('/instances', function(req, res) {
        instancesDao.getInstances(req.body.instanceIds, function(err, data) {
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

    app.get('/instances/delete/:instanceId', function(req, res) {
        instancesDao.removeInstancebyId(req.params.instanceId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }

            res.end('OK');
        });
    });
    //updateInstanceIp
    app.get('/instances/updateip/:instanceId/:ipaddress', function(req, res) { //function(instanceId, ipaddress, callback)
        instancesDao.updateInstanceIp(req.params.instanceId, req.params.ipaddress, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.end('OK');
        });
    });

    app.get('/instances/dockercontainerdetails/:instanceid', function(req, res) {
        //res.send(200);
        console.log('reached here a');
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        var cmd = 'echo -e \"GET /containers/json?all=1 HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';

        console.log('cmd received: ' + cmd);
        var stdOut = '';
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            //alert('Done');
            var _stdout = stdOut.split('\r\n');
            console.log('Docker containers : ' + _stdout.length);
            var start = false;
            var so = '';
            _stdout.forEach(function(k, v) {
                console.log(_stdout[v] + ':' + _stdout[v].length);
                if (start == true) {
                    so += _stdout[v];
                    console.log(v + ':' + _stdout[v].length);
                }
                if (_stdout[v].length == 1)
                    start = true;
                if (v >= _stdout.length - 1)
                    res.end(so);
            });

        }, function(stdOutData) {
            stdOut += stdOutData;
            // alert(stdOutData);
        }, function(stdOutErr) {
            res.send(500);
        });

    });
    app.get('/instances/dockercontainerdetails/:instanceid/:containerid', function(req, res) {
        //res.send(200);
        console.log('reached container details');
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        var cmd = 'echo -e \"GET /containers/' + req.params.containerid + '/json HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';

        console.log('cmd received: ' + cmd);
        var stdOut = '';
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            //alert('Done');
            var _stdout = stdOut.split('\r\n');
            console.log('Docker containers : ' + _stdout.length);
            var start = false;
            var so = '';
            _stdout.forEach(function(k, v) {
                console.log(_stdout[v] + ':' + _stdout[v].length);
                if (start == true) {
                    so += _stdout[v];
                    console.log(v + ':' + _stdout[v].length);
                }
                if (_stdout[v].length == 1)
                    start = true;
                if (v >= _stdout.length - 1)
                    res.end(so);
            });

        }, function(stdOutData) {
            stdOut += stdOutData;
            // alert(stdOutData);
        }, function(stdOutErr) {
            res.send(500);
        });

    });
    app.get('/instances/dockercontainerdetails/:instanceid/:containerid/:action', function(req, res) {
        //res.send(200);
        console.log('reached here action');
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        //Command mapping for security
        var action = 'start';
        switch (req.params.action) {
            case "1":
                action = 'start';
                break;
            case "2":
                action = 'stop';
                break;
            case "3":
                action = 'restart';
                break;
            case "4":
                action = 'pause';
                break;
            case "5":
                action = 'unpause';
                break;
        }


        //var cmd = 'echo -e \"GET /containers/' + req.params.containerid + '/json HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';
        var cmd = 'curl -XPOST http://localhost:4243/containers/' + req.params.containerid + '/' + action;
        console.log('cmd received: ' + cmd);
        var stdOut = '';
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            //alert('Done');
            if (!err) {
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: false,
                    log: "Container  " + req.params.containerid + " Action :" + action,
                    timestamp: new Date().getTime()
                });
                res.send(200);
            } else {
                console.log("Action Error : " + err);
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: true,
                    log: "Action Error : " + err,
                    timestamp: new Date().getTime()
                });
                res.send(500);
            }

        }, function(stdOutData) {
            stdOut += stdOutData;
            logsDao.insertLog({
                referenceId: instanceid,
                err: false,
                log: "Container  " + req.params.containerid + ":" + stdOutData,
                timestamp: new Date().getTime()
            });
            // alert(stdOutData);
        }, function(stdOutErr) {
            res.send(500);
        });

    });

    app.get('/instances/dockerimagepull/:instanceid/:imagename/:tagname/:runcommand', function(req, res) {

        console.log('reached here a');
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        var runcmd = '';
        var tagname = '';
        
        if (req.params.tagname != 'undefined') {
            tagname += ':' + req.params.tagname;
        }

        var cmd = 'sudo docker pull ' + decodeURIComponent(req.params.imagename) + tagname;

        if (req.params.runcommand != 'undefined') {
            runcmd = decodeURIComponent(req.params.runcommand) + ' ';
        }
        cmd += ' && sudo docker run -i -t -d ' + runcmd +  decodeURIComponent(req.params.imagename) + tagname + ' /bin/bash';
        console.log('Docker command executed : ' + cmd);
        _docker.runDockerCommands(cmd, req.params.instanceid,
            function(err, retCode) {
                if (err) {
                    logsDao.insertLog({
                        referenceId: instanceid,
                        err: true,
                        log: 'Unable to run chef-client',
                        timestamp: new Date().getTime()
                    });
                    res.send(err);
                    return;
                }

                console.log("docker return ", retCode);
                //if retCode == 0 //update docker status into instacne
                instancesDao.updateInstanceDockerStatus(instanceid, "success", '', function(data) {
                    console.log('Instance Docker Status set to Success');
                });



                res.send(200);

            },
            function(stdOutData) {
                if (!stdOutData) {

                    console.log("SSH Stdout :" + stdOutData.toString('ascii'));
                    stdmessages += stdOutData.toString('ascii');
                } else {
                    logsDao.insertLog({
                        referenceId: instanceid,
                        err: false,
                        log: stdOutData.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                    console.log("SSH Stdout :" + instanceid + stdOutData.toString('ascii'));
                    stdmessages += stdOutData.toString('ascii');
                }
            }, function(stdOutErr) {
                logsDao.insertLog({
                    referenceId: instanceid,
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

                        var chefClientOptions = {
                            privateKey: decryptedCredentials.pemFileLocation,
                            username: decryptedCredentials.username,
                            host: instance.instanceIP,
                            instanceOS: instance.hardware.os,
                            port: 22,
                            runlist: req.body.runlist,
                            overrideRunlist: false
                        }
                        console.log('decryptCredentials ==>', decryptedCredentials);
                        if (decryptedCredentials.pemFileLocation) {
                            chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                        } else {
                            chefClientOptions.password = decryptedCredentials.password;
                        }

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




    app.post('/instances/:instanceId/services/add', function(req, res) {
        console.log('serviceIds ==>', req.body.serviceIds, req.body.serviceIds.length);
        instancesDao.addService(req.params.instanceId, req.body.serviceIds, function(err, updateCount) {
            if (err) {
                console.log(err)
                res.send(500);
                return;
            }
            console.log(updateCount);
            if (updateCount > 0) {
                res.send(200, req.body.serviceIds);
            } else {
                res.send(200, []);
            }

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

    app.get('/instances/:instanceId/services/:serviceId/:actionType', function(req, res) {
        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                res.send(500);
                return;
            }
            if (!instances.length) {
                res.send(400);
                return;
            }
            var instance = instances[0];
            configmgmtDao.getServiceFromId(req.params.serviceId, function(err, services) {
                if (err) {
                    console.log(err);
                    res.send(500);
                    return;
                }
                if (!services.length) {
                    res.send(404);
                    return;
                }

                var serviceData = services[0];
                console.log(serviceData);

                function onComplete(err, retCode) {
                    if (err) {
                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: true,
                            log: 'Unable to run services',
                            timestamp: new Date().getTime()
                        });
                        return;
                    }
                    console.log("ret code", retCode);
                    if (retCode == 0) {
                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: false,
                            log: 'Service run success',
                            timestamp: new Date().getTime()
                        });
                    } else {
                        logsDao.insertLog({
                            referenceId: req.params.instanceId,
                            err: true,
                            log: 'Unable to run services',
                            timestamp: new Date().getTime()
                        });
                    }
                }

                function onStdOut(stdOutData) {
                    logsDao.insertLog({
                        referenceId: req.params.instanceId,
                        err: false,
                        log: stdOutData.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                }

                function onStdErr(stdOutErr) {
                    logsDao.insertLog({
                        referenceId: req.params.instanceId,
                        err: true,
                        log: stdOutErr.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                }
                credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                    if (serviceData.commandtype === "Chef Cookbook/Recepie") {
                        configmgmtDao.getChefServerDetails(serviceData.chefserverid, function(err, chefDetails) {
                            if (err) {
                                res.send(500);
                                return;
                            }
                            if (!chefDetails) {
                                res.send(500);
                                return;
                            }
                            //decrypting pem file
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
                            var actionType = req.params.actionType;
                            var runlist = [];
                            if (actionType == 'start' && (serviceData.servicestart && serviceData.servicestart != 'none')) {
                                runlist.push('recipe[' + serviceData.servicestart + ']');
                            } else if (actionType == 'stop' && (serviceData.servicestop && serviceData.servicestop != 'none')) {
                                runlist.push('recipe[' + serviceData.servicestop + ']');
                            } else if (actionType == 'restart' && (serviceData.servicerestart && serviceData.servicerestart != 'none')) {
                                runlist.push('recipe[' + serviceData.servicerestart + ']');
                            } else if (actionType == 'kill' && (serviceData.servicekill && serviceData.servicekill != 'none')) {
                                runlist.push('recipe[' + serviceData.servicekill + ']');
                            } else if (actionType == 'status' && (serviceData.servicestatus && serviceData.servicestatus != 'none')) {
                                runlist.push('recipe[' + serviceData.servicestatus + ']');
                            }
                            var chefClientOptions = {
                                privateKey: instance.credentials.pemFileLocation,
                                username: instance.credentials.username,
                                host: instance.instanceIP,
                                instanceOS: instance.hardware.os,
                                port: 22,
                                runlist: runlist, // runing service runlist
                                overrideRunlist: true
                            }
                            if (decryptedCredentials.pemFileLocation) {
                                chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                            } else {
                                chefClientOptions.password = decryptedCredentials.password;
                            }
                            console.log('running chef client');
                            chef.runChefClient(chefClientOptions, function(err, ret) {
                                if (decryptedCredentials.pemFileLocation) {
                                    fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                        if (err) {
                                            console.log("Unable to delete temp pem file =>", err);
                                        } else {
                                            console.log("temp pem file deleted =>", err);
                                        }
                                    });
                                }
                                onComplete(err, ret);
                            }, onStdOut, onStdErr);
                            res.send(200);

                        });

                    } else {
                        //running command
                        var sshParamObj = {
                            host: instance.instanceIP,
                            port: 22,
                            username: instance.credentials.username,
                        };
                        var sudoCmd;
                        if (decryptedCredentials.pemFileLocation) {
                            sshParamObj.pemFilePath = decryptedCredentials.pemFileLocation;
                        } else {
                            sshParamObj.password = decryptedCredentials.password;
                        }
                        //var sshConnection = new SSH(sshParamObj);

                        javaSSHWrapper.getNewInstance(sshParamObj, function(err, javaSSh) {
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            javaSSh.runServiceCmd(serviceData.command, req.params.actionType, function(err, ret) {
                                if (decryptedCredentials.pemFileLocation) {
                                    fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                        if (err) {
                                            console.log("Unable to delete temp pem file =>", err);
                                        } else {
                                            console.log("temp pem file deleted =>", err);
                                        }
                                    });
                                }
                                onComplete(err, ret);
                            }, onStdOut, onStdErr);
                            res.send(200);
                        });
                    }
                });
            });
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