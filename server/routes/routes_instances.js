var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/dao/instancesdao');
var EC2 = require('../lib/ec2.js');
var Chef = require('../lib/chef.js');
var taskstatusDao = require('../model/taskstatus');
var logsDao = require('../model/dao/logsdao.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var Docker = require('../model/docker.js');
var SSH = require('../lib/utils/sshexec');
var appConfig = require('../config/app_config.js');
var usersDao = require('../model/users.js');
var credentialCryptography = require('../lib/credentialcryptography')
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var javaSSHWrapper = require('../model/javaSSHWrapper.js');
var errorResponses = require('./error_responses');
var logger = require('../lib/logger')(module);
var waitForPort = require('wait-for-port');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/instances/*', sessionVerificationFunc);


    app.get('/instances', function(req, res) {
        logger.debug("Enter get() for /instances");
        instancesDao.getInstances(null, function(err, data) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }
            logger.debug("Successfully sent data ", data);
            res.send(data);
            logger.debug("Exit get() for /instances");
        });
    });

    app.get('/instances/rdp/:vmname/:port',function(req,res){

        res.setHeader('Content-disposition', 'attachment; filename='+ req.params.vmname + '.rdp');
        res.setHeader('Content-type', 'rdp');
        //res.charset = 'UTF-8';
        var rdptext = "full address:s:" + req.params.vmname + ":" + req.params.port + "\n\r";
        rdptext += "prompt for credentials:i:1"
        res.write(rdptext);
        res.end();

    });

    app.post('/instances', function(req, res) {
        logger.debug("Enter post() for /instances");
        instancesDao.getInstances(req.body.instanceIds, function(err, data) {
            if (err) {
                logger.error("Instance creation Failed >> ", err);
                res.send(500);
                return;
            }
            res.send(data);
            logger.debug("Exit post() for /instances");
        });
    });

    app.get('/instances/:instanceId', function(req, res) {
        logger.debug("Enter get() for /instances/%s", req.params.instanceId);
        instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
            if (err) {
                logger.error("Instance fetch Failed >> ", err);
                res.send(500);
                return;
            }

            if (data.length) {
                res.send(data[0]);
            } else {
                logger.error("No such Instance for >> %s", req.params.instanceId);
                res.send(404);
            }
            logger.debug("Exit get() for /instances/%s", req.params.instanceId);
        });
    });

    app.delete('/instances/:instanceId', function(req, res) {
        logger.debug("Enter delete() for /instances/%s", req.params.instanceId);

        function removeInstanceFromDb() {
            instancesDao.removeInstancebyId(req.params.instanceId, function(err, data) {
                if (err) {
                    logger.error("Instance deletion Failed >> ", err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                logger.debug("Exit delete() for /instances/%s", req.params.instanceid);
                res.send(200);
            });
        }
        if (req.query.chefRemove && req.query.chefRemove === 'true') {
            instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
                if (err) {
                    logger.debug("Failed to fetch Instance ", err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                var instance = data[0];
                configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                    if (err) {
                        logger.debug("Failed to fetch ChefServerDetails ", err);
                        res.send(500, errorResponses.chef.corruptChefData);
                        return;
                    }
                    var chef = new Chef({
                        userChefRepoLocation: chefDetails.chefRepoLocation,
                        chefUserName: chefDetails.loginname,
                        chefUserPemFile: chefDetails.userpemfile,
                        chefValidationPemFile: chefDetails.validatorpemfile,
                        hostedChefUrl: chefDetails.url,
                    });
                    chef.deleteNode(instance.chef.chefNodeName, function(err, nodeData) {
                        if (err) {
                            logger.debug("Failed to delete node ", err);
                            res.send(500);
                        } else {
                            removeInstanceFromDb();
                            logger.debug("Successfully removed instance from db.");
                        }
                    });

                });
            });
        } else {
            removeInstanceFromDb();
            logger.debug("Successfully removed instance from db.");
        }
        logger.debug("Exit delete() for /instances/%s", req.params.instanceId);
    });

    app.post('/instances/:instanceId/appUrl', function(req, res) { //function(instanceId, ipaddress, callback)

        instancesDao.addAppUrls(req.params.instanceId, req.body.appUrls, function(err, updateCount) {
            if (err) {
                logger.error("Failed to update instanceip", err);
                res.send(500);
                return;
            }
            res.send({
                updateCount: updateCount
            });
        });
    });


    app.post('/instances/:instanceId/appUrl/:appUrlId/update', function(req, res) { //function(instanceId, ipaddress, callback)
        logger.debug("Enter post() for /instances/%s/appUrl/update", req.params.instanceId);
        instancesDao.updateAppUrl(req.params.instanceId, req.params.appUrlId, req.body.url, function(err, updateCount) {
            if (err) {
                logger.error("Failed to update instanceip", err);
                res.send(500);
                return;
            }
            res.send({
                updateCount: updateCount
            });
        });
    });

    //updateInstanceIp
    app.get('/instances/updateip/:instanceId/:ipaddress', function(req, res) { //function(instanceId, ipaddress, callback)
        logger.debug("Enter get() for /instances/updateip/%s/%s", req.params.instanceId, req.params.ipaddress);
        instancesDao.updateInstanceIp(req.params.instanceId, req.params.ipaddress, function(err, data) {
            if (err) {
                logger.error("Failed to update instanceip", err);
                res.send(500);
                return;
            }
            logger.debug("Successfully updated instanceip");
            res.end('OK');
        });
        logger.debug("Exit get() for /instances/updateip/%s/%s", req.params.instanceId, req.params.ipaddress);
    });

    app.get('/instances/dockercontainerdetails/:instanceid', function(req, res) {
        logger.debug("Enter get() for /instances/dockercontainerdetails/%s", req.params.instanceid);
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        var cmd = 'echo -e \"GET /containers/json?all=1 HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';

        logger.debug('cmd received: ', cmd);
        var stdOut = '';
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            //alert('Done');
            var _stdout = stdOut.split('\r\n');
            logger.debug('Docker containers : %s', _stdout.length);
            var start = false;
            var so = '';
            _stdout.forEach(function(k, v) {
                logger.debug(_stdout[v] + ':' + _stdout[v].length);
                if (start == true) {
                    so += _stdout[v];
                    logger.debug(v + ':' + _stdout[v].length);
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
            logger.error("Error hits to fetch docker details", stdOutErr);
            res.send(500);
        });
        logger.debug("Exit get() for /instances/dockercontainerdetails/%s", req.params.instanceid);

    });
    app.get('/instances/dockercontainerdetails/:instanceid/:containerid', function(req, res) {
        //res.send(200);
        logger.debug("Enter get() for /instances/dockercontainerdetails/%s/%s", req.params.instanceid, req.params.containerid);
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        var cmd = 'echo -e \"GET /containers/' + req.params.containerid + '/json HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';

        logger.debug('cmd received: ', cmd);
        var stdOut = '';
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            //alert('Done');
            var _stdout = stdOut.split('\r\n');
            logger.debug('Docker containers : ', _stdout.length);
            var start = false;
            var so = '';
            _stdout.forEach(function(k, v) {
                logger.debug(_stdout[v] + ':' + _stdout[v].length);
                if (start == true) {
                    so += _stdout[v];
                    logger.debug(v + ':' + _stdout[v].length);
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
            logger.error("Hit some error: ", stdOutErr);
            res.send(500);
        });
        logger.debug("Exit get() for /instances/dockercontainerdetails/%s/%s", req.params.instanceid, req.params.containerid);

    });
    app.get('/instances/dockerexecute/:instanceid/:containerid/:action', function(req, res) {
        logger.debug("Enter get() for /instances/dockerexecute/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var cmd = "sudo docker exec " + req.params.containerid + ' bash ' + req.params.action;
        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            if (!err) {
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: false,
                    log: "Container  " + req.params.containerid + " Executed :" + req.params.action,
                    timestamp: new Date().getTime()
                });
                logger.debug("Docker Command run Successfully");
                res.send(200);
                logger.debug("Exit get() for /instances/dockerexecute/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
            } else {
                logger.error("Excute Error : ", err);
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: true,
                    log: "Excute Error : " + err,
                    timestamp: new Date().getTime()
                });
                logger.error("Error hits while running Docker Command: ", err);
                res.send(500);
            }
        });


    });
    app.get('/instances/dockercontainerdetails/:instanceid/:containerid/:action', function(req, res) {
        logger.debug("Enter get() for /instances/dockercontainerdetails/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
        var instanceid = req.params.instanceid;
        var _docker = new Docker();
        var stdmessages = '';
        //Command mapping for security
        var action = 'start';
        var action1 = action;
        switch (req.params.action) {
            case "1":
                action = 'start';
                action1 = 'start';
                break;
            case "2":
                action = 'stop';
                break;
            case "3":
                action = 'restart';
                action1 = 'start';
                break;
            case "4":
                action = 'pause';
                action1 = 'start';
                break;
            case "5":
                action = 'unpause';
                action1 = 'start';
                break;
            case "6":
                action = 'delete';
                action1 = 'terminate';
                break;
        }


        //var cmd = 'echo -e \"GET /containers/' + req.params.containerid + '/json HTTP/1.0\r\n\" | sudo nc -U /var/run/docker.sock';

        var cmd = 'curl -XPOST http://localhost:4243/containers/' + req.params.containerid + '/' + action;
        if (action == 'delete') {
            cmd = 'sudo docker stop ' + req.params.containerid + ' &&  sudo docker rm ' + req.params.containerid;
        }

        logger.debug('cmd received: ', cmd);
        var stdOut = '';
        logger.debug('Verifying User permission set for execute.');
        var user = req.session.user;
        var category = 'dockercontainer' + action1;
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
                        //alert('Done');
                        if (!err) {
                            logsDao.insertLog({
                                referenceId: instanceid,
                                err: false,
                                log: "Container  " + req.params.containerid + " Action :" + action,
                                timestamp: new Date().getTime()
                            });
                            logger.debug("Exit get() for /instances/dockercontainerdetails/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
                            res.send(200);
                        } else {
                            logger.error("Action Error : ", err);
                            logsDao.insertLog({
                                referenceId: instanceid,
                                err: true,
                                log: "Action Error : " + err,
                                timestamp: new Date().getTime()
                            });
                            logger.error("Error hits while running Docker Command: ", err);
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
                        logger.error("Error hits while running Docker Command: ", err);
                        res.send(500);
                    });
                } //else haspermission
            } //if !err
        }); //haspermission

    });
    app.get('/instances/checkfordocker/:instanceid', function(req, res) {
        logger.debug("Enter get() for /instances/checkfordocker/%s", req.params.instanceid);

        //Confirming if Docker has been installed on the box
        var _docker = new Docker();
        var cmd = "sudo docker ps";
        logger.debug('Docker command executed : ', cmd);
        _docker.runDockerCommands(cmd, req.params.instanceid,
            function(err, retCode) {
                if (err) {
                    logger.error("Failed to Excute Docker command: ", err);
                    res.send(500);
                    return;
                    //res.end('200');

                }
                console.log('this ret:' + retCode);
                if (retCode == '0') {
                    instancesDao.updateInstanceDockerStatus(req.params.instanceid, "success", '', function(data) {
                        console.log('Instance Docker Status set to Success');
                        logger.debug("Exit get() for /instances/checkfordocker/%s", req.params.instanceid);
                        res.send('OK');
                        return;
                    });

                } else
                    logger.debug("Sending empty response.");
                res.send('');
            });


    });
    app.get('/instances/dockerimagepull/:instanceid/:dockerreponame/:imagename/:tagname/:runparams/:startparams', function(req, res) {

        logger.debug("Enter get() for /instances/dockerimagepull");
        var instanceid = req.params.instanceid;
        instancesDao.getInstanceById(req.params.instanceid, function(err, data) {
            if (err) {
                logger.error("Instance fetch Failed >> ", err);
                res.send(500);
                return;
            }
            logger.debug(data.length + ' ' + JSON.stringify(data));
            if (data.length) {
                logger.debug(' Docker dockerEngineStatus : ' + data[0].docker.dockerEngineStatus);
                if (data[0].docker.dockerEngineStatus) {
                    if (data[0].docker.dockerEngineStatus != "success") {
                        res.end('No Docker Found');
                        return;
                    }
                } else {
                    res.end('No Docker Found');
                    return;
                }
                configmgmtDao.getMasterRow(18, 'dockerreponame', req.params.dockerreponame, function(err, data) {
                    if (!err) {

                        //  var dockerRepo = JSON.parse(data);
                        logger.debug('Docker Repo ->', JSON.stringify(data));
                        var dock = JSON.parse(data);
                        // var dockkeys = Object.keys(data);
                        logger.debug('username:', dock.dockeruserid);

                        var _docker = new Docker();
                        var stdmessages = '';

                        var cmd = "sudo docker login -e " + dock.dockeremailid + ' -u ' + dock.dockeruserid + ' -p ' + dock.dockerpassword;

                        //cmd += ' && sudo docker pull ' + dock.dockeruserid  + '/' + decodeURIComponent(req.params.imagename);
                        //removing docker userID
                        cmd += ' && sudo docker pull ' + decodeURIComponent(req.params.imagename);
                        logger.debug('Intermediate cmd: ', cmd);
                        if (req.params.tagname != null) {
                            cmd += ':' + req.params.tagname;
                        }
                        var runparams = '';
                        if (req.params.runparams != 'null') {
                            runparams = decodeURIComponent(req.params.runparams);
                        }
                        var startparams = '';
                        if (req.params.startparams != 'null') {
                            startparams = decodeURIComponent(req.params.startparams);
                        } else
                            startparams = '/bin/bash';
                        cmd += ' && sudo docker run -i -t -d ' + runparams + ' ' + decodeURIComponent(req.params.imagename) + ':' + req.params.tagname + ' ' + startparams;
                        logger.debug('Docker command executed : ', cmd);
                        _docker.runDockerCommands(cmd, req.params.instanceid,
                            function(err, retCode) {
                                if (err) {
                                    logsDao.insertLog({
                                        referenceId: instanceid,
                                        err: true,
                                        log: 'Failed to Excute Docker command: . cmd : ' + cmd + '. Error: ' + err,
                                        timestamp: new Date().getTime()
                                    });
                                    logger.error("Failed to Excute Docker command: ", err);
                                    res.send(err);
                                    return;
                                }

                                logger.debug("docker return ", retCode);
                                if (retCode == 0)
                                //if retCode == 0 //update docker status into instacne
                                {
                                    instancesDao.updateInstanceDockerStatus(instanceid, "success", '', function(data) {
                                        logger.debug('Instance Docker Status set to Success');
                                        res.send(200);
                                    });


                                } else {
                                    logger.debug('Failed running docker command ....');
                                    res.end('Image pull failed check instance log for details');


                                }
                                logger.debug("Exit get() for /instances/dockerimagepull");

                            },
                            function(stdOutData) {
                                if (!stdOutData) {

                                    logger.debug("SSH Stdout :" + stdOutData.toString('ascii'));
                                    stdmessages += stdOutData.toString('ascii');
                                } else {
                                    logsDao.insertLog({
                                        referenceId: instanceid,
                                        err: false,
                                        log: stdOutData.toString('ascii'),
                                        timestamp: new Date().getTime()
                                    });
                                    logger.debug("Docker run stdout :" + instanceid + stdOutData.toString('ascii'));
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

                    }
                });
            } else {
                logger.debug('No Instance found with id : ' + instanceid);
                res.send(500);
                return;
            }
        });

    });

    app.post('/instances/:instanceId/updateRunlist', function(req, res) {
        if (req.session.user.rolename === 'Consumer') {
            res.send(401);
            return;
        }
        logger.debug("Enter post() for /instances/updateRunlist");
        if (!req.body.runlist) {
            res.send(400);
            return;
        }
        logger.debug(req.body.runlist);
        //verifying permission to update runlist
        logger.debug('Verifying User permission set for execute.');
        var user = req.session.user;
        var category = 'instancerunlist';
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
                        if (err) {
                            logger.error("Failed to get Instance: ", err);
                            res.send(500);
                            return;
                        }
                        if (data.length) {
                            var instance = data[0];
                            var actionLog = instancesDao.insertChefClientRunActionLog(instance.id, req.body.runlist, req.session.user.cn, new Date().getTime());
                            var logReferenceIds = [instance.id, actionLog._id];
                            configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                                if (err) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logReferenceIds,
                                        err: true,
                                        log: "Unable to get chef data. Chef run failed",
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
                                    res.send(200, {
                                        actionLogId: actionLog._id
                                    });
                                    return;
                                }
                                if (!chefDetails) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logReferenceIds,
                                        err: true,
                                        log: "Chef data in null. Chef run failed",
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);

                                    res.send(200, {
                                        actionLogId: actionLog._id
                                    });
                                    return;
                                }

                                //decrypting pem file
                                credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                                    if (err) {
                                        var timestampEnded = new Date().getTime();
                                        logsDao.insertLog({
                                            referenceId: logReferenceIds,
                                            err: true,
                                            log: "Unable to decrypt pem file. Chef run failed",
                                            timestamp: timestampEnded
                                        });
                                        instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
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
                                    logger.debug('decryptCredentials ==>', decryptedCredentials);
                                    if (decryptedCredentials.pemFileLocation) {
                                        chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                                    } else {
                                        chefClientOptions.password = decryptedCredentials.password;
                                    }

                                    logsDao.insertLog({
                                        referenceId: logReferenceIds,
                                        err: false,
                                        log: 'Running chef-client',
                                        timestamp: new Date().getTime()
                                    });

                                    chef.runChefClient(chefClientOptions, function(err, retCode) {
                                        if (decryptedCredentials.pemFileLocation) {
                                            fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                                if (err) {
                                                    logger.debug("Unable to delete temp pem file =>", err);
                                                } else {
                                                    logger.debug("temp pem file deleted =>", err);
                                                }
                                            });
                                        }

                                        if (err) {
                                            //console.log(err);
                                            var timestampEnded = new Date().getTime();
                                            logsDao.insertLog({
                                                referenceId: logReferenceIds,
                                                err: true,
                                                log: "Unable to run chef-client",
                                                timestamp: timestampEnded
                                            });
                                            instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
                                            return;
                                        }
                                        logger.debug("knife ret code", retCode);
                                        if (retCode == 0) {
                                            logger.debug('updating node runlist in db');
                                            instancesDao.updateInstancesRunlist(req.params.instanceId, req.body.runlist, function(err, updateCount) {
                                                if (err) {
                                                    return;
                                                }

                                                var timestampEnded = new Date().getTime();
                                                logsDao.insertLog({
                                                    referenceId: logReferenceIds,
                                                    err: false,
                                                    log: 'instance runlist updated',
                                                    timestamp: timestampEnded
                                                });
                                                instancesDao.updateActionLog(instance.id, actionLog._id, true, timestampEnded);

                                                //Checking docker status and updating
                                                var _docker = new Docker();
                                                _docker.checkDockerStatus(instance.id,
                                                    function(err, retCode) {
                                                        if (err) {
                                                            logger.error("Failed to check docker status: ", err);
                                                            res.send(500);
                                                            return;
                                                            //res.end('200');

                                                        }
                                                        logger.debug('Docker Check Returned:', retCode);
                                                        if (retCode == '0' || retCode == null) {
                                                            instancesDao.updateInstanceDockerStatus(req.params.instanceId, "success", '', function(data) {
                                                                logger.debug('Instance Docker Status set to Success');
                                                                logger.debug("Exit post() for /instances/dockerimagepull");
                                                            });
                                                        }
                                                        if (retCode == '1') {
                                                            instancesDao.updateInstanceDockerStatus(req.params.instanceId, "", '', function(data) {
                                                                logger.debug('Instance Docker Status set to None');
                                                                logger.debug("Exit post() for /instances/dockerimagepull");
                                                            });
                                                        }

                                                    });

                                            });
                                        } else {
                                            if (retCode === -5000) {
                                                logsDao.insertLog({
                                                    referenceId: logReferenceIds,
                                                    err: true,
                                                    log: 'Host Unreachable',
                                                    timestamp: new Date().getTime()
                                                });
                                            } else if (retCode === -5001) {
                                                logsDao.insertLog({
                                                    referenceId: logReferenceIds,
                                                    err: true,
                                                    log: 'Invalid credentials',
                                                    timestamp: new Date().getTime()
                                                });

                                            } else {
                                                logsDao.insertLog({
                                                    referenceId: logReferenceIds,
                                                    err: true,
                                                    log: 'Unknown error occured. ret code = ' + retCode,
                                                    timestamp: new Date().getTime()
                                                });

                                            }
                                            var timestampEnded = new Date().getTime();
                                            logsDao.insertLog({
                                                referenceId: logReferenceIds,
                                                err: true,
                                                log: 'Unable to run chef-client',
                                                timestamp: timestampEnded
                                            });
                                            instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
                                            return;
                                        }
                                    }, function(stdOutData) {
                                        logsDao.insertLog({
                                            referenceId: logReferenceIds,
                                            err: false,
                                            log: stdOutData.toString('ascii'),
                                            timestamp: new Date().getTime()
                                        });

                                    }, function(stdOutErr) {
                                        logsDao.insertLog({
                                            referenceId: logReferenceIds,
                                            err: true,
                                            log: stdOutErr.toString('ascii'),
                                            timestamp: new Date().getTime()
                                        });
                                    });
                                    res.send(200, {
                                        actionLogId: actionLog._id
                                    });

                                });
                            });
                        } else {
                            res.send(404);
                        }
                    });

                } //else haspermission
            } //if !err
        }); //haspermission
    });

    app.get('/instances/:instanceId/stopInstance', function(req, res) {
        logger.debug("Enter get() for /instances/%s/stopInstance", req.params.instanceId);
        logger.debug('Verifying User permission set for stopInstance.');
        var user = req.session.user;
        var category = 'instancestop';
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
                        if (err) {
                            logger.error("Error hits getting instance: ", err);
                            res.send(500);
                            return;
                        }
                        logger.debug("data.providerId: ::::   ",JSON.stringify(data[0]));
                        if (data.length) {
                            AWSProvider.getAWSProviderById(data[0].providerId, function(err, aProvider) {
                               if (err) {
                                   logger.error(err);
                                   res.send(500, "Unable to get Provider.");
                                   return;
                               }
                               logger.debug("Provider:>>>>>>>>>> ",JSON.stringify(aProvider));
                               AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id,function(err,keyPair){
                                logger.debug("keyPairs length::::: ",keyPair[0].region);
                                if(err){
                                    res.send(500,"Error getting to fetch Keypair.")      
                                }
                            var timestampStarted = new Date().getTime();

                            var actionLog = instancesDao.insertStopActionLog(req.params.instanceId, req.session.user.cn, timestampStarted);

                            var logReferenceIds = [req.params.instanceId];
                            if (actionLog) {
                                logReferenceIds.push(actionLog._id);
                            }
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: false,
                                log: "Instance Stopping",
                                timestamp: timestampStarted
                            });

                            var ec2 = new EC2({
                             "access_key": aProvider.accessKey,
                             "secret_key": aProvider.secretKey,
                             "region"    : keyPair[0].region
                            });
                            ec2.stopInstance([data[0].platformId], function(err, stoppingInstances) {
                                if (err) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logReferenceIds,
                                        err: true,
                                        log: "Unable to stop instance",
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);
                                    res.send(500, {
                                        actionLogId: actionLog._id
                                    });
                                    return;
                                }
                                logger.debug("Exit get() for /instances/%s/stopInstance", req.params.instanceId);
                                res.send(200, {
                                    instanceCurrentState: stoppingInstances[0].CurrentState.Name,
                                    actionLogId: actionLog._id
                                });

                                instancesDao.updateInstanceState(req.params.instanceId, stoppingInstances[0].CurrentState.Name, function(err, updateCount) {
                                    if (err) {
                                        logger.error("update instance state err ==>", err);
                                        return;
                                    }
                                    logger.debug('instance state upadated');
                                });

                            }, function(err, state) {
                                if (err) {
                                    return;
                                }
                                instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
                                    if (err) {
                                        logger.error("update instance state err ==>", err);
                                        return;
                                    }
                                    logger.debug('instance state upadated');
                                });
                                var timestampEnded = new Date().getTime();


                                logsDao.insertLog({
                                    referenceId: logReferenceIds,
                                    err: false,
                                    log: "Instance Stopped",
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(req.params.instanceId, actionLog._id, true, timestampEnded);

                                 });
                            });
                        });


                        } else {
                            res.send(404);
                            return;
                        }
                    });
                } //else haspermission
            } //if !err
        }); //haspermission
    });

    app.get('/instances/:instanceId/startInstance', function(req, res) {
        logger.debug("Enter get() for /instances/%s/startInstance", req.params.instanceId);
        logger.debug('Verifying User permission set for startInstance.');
        var user = req.session.user;
        var category = 'instancestart';
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
                        if (err) {
                            res.send(500);
                            return;
                        }
                        if (data.length) {

                            AWSProvider.getAWSProviderById(data[0].providerId, function(err, aProvider) {
                               if (err) {
                                   logger.error(err);
                                   res.send(500, "Unable to find Provider.");
                                   return;
                               }
                               AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id,function(err,keyPair){
                                logger.debug("keyPairs length::::: ",keyPair[0].region);
                                if(err){
                                    res.send(500,"Error getting to fetch Keypair.")      
                                }

                            var timestampStarted = new Date().getTime();

                            var actionLog = instancesDao.insertStartActionLog(req.params.instanceId, req.session.user.cn, timestampStarted);

                            var logReferenceIds = [req.params.instanceId];
                            if (actionLog) {
                                logReferenceIds.push(actionLog._id);
                            }


                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: false,
                                log: "Instance Starting",
                                timestamp: timestampStarted
                            });

                            var ec2 = new EC2({
                             "access_key": aProvider.accessKey,
                             "secret_key": aProvider.secretKey,
                             "region"    : keyPair[0].region
                            });
                            ec2.startInstance([data[0].platformId], function(err, startingInstances) {
                                if (err) {
                                    var timestampEnded = new Date().getTime();
                                    logsDao.insertLog({
                                        referenceId: logReferenceIds,
                                        err: true,
                                        log: "Unable to start instance",
                                        timestamp: timestampEnded
                                    });
                                    instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);
                                    res.send(500, {
                                        actionLogId: actionLog._id
                                    });
                                    return;
                                }
                                logger.debug("Exit get() for /instances/%s/startInstance", req.params.instanceId);
                                res.send(200, {
                                    instanceCurrentState: startingInstances[0].CurrentState.Name,
                                    actionLogId: actionLog._id
                                });

                                instancesDao.updateInstanceState(req.params.instanceId, startingInstances[0].CurrentState.Name, function(err, updateCount) {
                                    if (err) {
                                        logger.error("update instance state err ==>", err);
                                        return;
                                    }
                                    logger.debug('instance state upadated');
                                });

                            }, function(err, state) {
                                if (err) {
                                    return;
                                }
                                instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
                                    if (err) {
                                        logger.error("update instance state err ==>", err);
                                        return;
                                    }
                                    logger.debug('instance state upadated');
                                });
                                var timestampEnded = new Date().getTime()
                                logsDao.insertLog({
                                    referenceId: logReferenceIds,
                                    err: false,
                                    log: "Instance Started",
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(req.params.instanceId, actionLog._id, true, timestampEnded);


                                ec2.describeInstances([data[0].platformId], function(err, data) {
                                    if (err) {
                                        logger.error("Hit some error: ", err);
                                        return;
                                    }
                                    if (data.Reservations.length && data.Reservations[0].Instances.length) {
                                        logger.debug("ip =>", data.Reservations[0].Instances[0].PublicIpAddress);
                                        instancesDao.updateInstanceIp(req.params.instanceId, data.Reservations[0].Instances[0].PublicIpAddress, function(err, updateCount) {
                                            if (err) {
                                                logger.error("update instance ip err ==>", err);
                                                return;
                                            }
                                            logger.debug('instance ip upadated');
                                        });
                                    }
                                });
                            });
                        });
                        });

                        } else {
                            res.send(404);
                            return;
                        }
                    });


                } //else haspermission
            } //if !err
        }); //haspermission

    });


    app.get('/instances/:instanceId/logs', function(req, res) {
        logger.debug("Enter get() for /instances/%s/logs", req.params.instanceId);
        var timestamp = req.query.timestamp;
        if (timestamp) {
            timestamp = parseInt(timestamp);
        }
        var timestampEnded = req.query.timestampEnded;
        if (timestampEnded) {
            timestampEnded = parseInt(timestampEnded);
        }
        logsDao.getLogsByReferenceIdAndTimestamp(req.params.instanceId, timestamp, timestampEnded, function(err, data) {
            if (err) {
                logger.error("Found error to fetch Logs: ", err);
                res.send(500);
                return;
            }
            logger.debug("Exit get() for /instances/%s/logs", req.params.instanceId);
            res.send(data);

        });
        /*logsDao.getLogsByReferenceId(req.params.instanceId, timestamp, function(err, data) {
            if (err) {
                logger.error("Found error to fetch Logs: ", err);
                res.send(500);
                return;
            }
            logger.debug("Exit get() for /instances/%s/logs", req.params.instanceId);
            res.send(data);

        });*/
    });




    app.post('/instances/:instanceId/services/add', function(req, res) {
        logger.debug("Enter post() for /instances/%s/services/add", req.params.instanceId);
        logger.debug('serviceIds ==>', req.body.serviceIds);

        logger.debug('Verifying User permission set for execute.');
        var user = req.session.user;
        var category = 'instanceservices';
        var permissionto = 'execute';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission :  launch ' + data + ' , Condition State : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);
                    return;
                } else {
                    instancesDao.addService(req.params.instanceId, req.body.serviceIds, function(err, updateCount) {
                        if (err) {
                            logger.error("Found error while adding service: ", err);
                            res.send(500);
                            return;
                        }
                        console.log(updateCount);
                        if (updateCount > 0) {
                            logger.debug("Exit post() for /instances/%s/services/add", req.params.instanceId);
                            res.send(200, req.body.serviceIds);
                        } else {
                            logger.debug("Exit post() for /instances/%s/services/add", req.params.instanceId);
                            res.send(200, []);
                        }

                    });
                } //else haspermission
            } //if !err
        }); //haspermission
    });

    app.delete('/instances/:instanceId/services/:serviceId', function(req, res) {
        logger.debug("Enter delete() for /instances/%s/services/%s", req.params.instanceId, req.params.serviceId);
        instancesDao.deleteService(req.params.instanceId, req.params.serviceId, function(err, deleteCount) {
            if (err) {
                logger.error("Found error while deleting service: ", err);
                res.send(500);
                return;
            }
            console.log(deleteCount);
            if (deleteCount) {
                logger.debug("Exit delete() for /instances/%s/services/%s", req.params.instanceId, req.params.serviceId);
                res.send({
                    deleteCount: deleteCount
                }, 200);
            } else {
                res.send(400);
            }

        });


    });

    app.get('/instances/:instanceId/services/:serviceId/:actionType', function(req, res) {
        logger.debug("Enter get() for /instances/%s/services/%s/%s", req.params.instanceId, req.params.serviceId, req.params.actionType);
        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                logger.error("Getting error while fetching instance: ", err);
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
                    logger.error("Getting error while fetching service: ", err);
                    res.send(500);
                    return;
                }
                if (!services.length) {
                    logger.error("Service not found: ", services.length);
                    res.send(404);
                    return;
                }

                var serviceData = services[0];
                logger.debug("serviceData", serviceData);
                var timestampStarted = new Date().getTime();
                var actionLog = instancesDao.insertServiceActionLog(req.params.instanceId, {
                    serviceName: serviceData.servicename,
                    type: req.params.actionType
                }, req.session.user.cn, timestampStarted);
                var logReferenceIds = [req.params.instanceId, actionLog._id];

                function onComplete(err, retCode) {
                    if (err) {
                        var timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logReferenceIds,
                            err: true,
                            log: 'Unable to run services',
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);
                        return;
                    }
                    logger.debug("ret code", retCode);

                    if (retCode == 0) {
                        var timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logReferenceIds,
                            err: false,
                            log: 'Service run success',
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(req.params.instanceId, actionLog._id, true, timestampEnded);
                    } else {
                        var timestampEnded = new Date().getTime();
                        if (retCode === -5000) {
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: 'Host Unreachable',
                                timestamp: timestampEnded
                            });
                        } else if (retCode === -5001) {
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: 'Invalid credentials',
                                timestamp: timestampEnded
                            });
                        } else {
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: 'Unknown error occured. ret code = ' + retCode,
                                timestamp: timestampEnded
                            });
                        }
                        timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logReferenceIds,
                            err: true,
                            log: 'Unable to run services',
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);

                    }
                }

                function onStdOut(stdOutData) {
                    logsDao.insertLog({
                        referenceId: logReferenceIds,
                        err: false,
                        log: stdOutData.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                }

                function onStdErr(stdOutErr) {
                    logsDao.insertLog({
                        referenceId: logReferenceIds,
                        err: true,
                        log: stdOutErr.toString('ascii'),
                        timestamp: new Date().getTime()
                    });
                }
                credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                    //decrypting pem file
                    if (err) {
                        var timestampEnded = new Date().getTime();
                        logsDao.insertLog({
                            referenceId: logReferenceIds,
                            err: true,
                            log: 'Unable to decrypt credentials. Unable to run service',
                            timestamp: timestampEnded
                        });
                        instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);

                        res.send(500, {
                            actionLogId: actionLog._id
                        });
                        return;
                    }
                    if (serviceData.commandtype === "Chef Cookbook/Recepie") {
                        configmgmtDao.getChefServerDetails(serviceData.chefserverid, function(err, chefDetails) {
                            if (err) {
                                var timestampEnded = new Date().getTime();
                                logsDao.insertLog({
                                    referenceId: logReferenceIds,
                                    err: true,
                                    log: 'Chef Data corrupted. Unable to run service',
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);

                                res.send(500, {
                                    actionLogId: actionLog._id
                                });
                                return;
                            }
                            if (!chefDetails) {
                                var timestampEnded = new Date().getTime();
                                logsDao.insertLog({
                                    referenceId: logReferenceIds,
                                    err: true,
                                    log: 'Chef Data corrupted. Unable to run service',
                                    timestamp: timestampEnded
                                });
                                instancesDao.updateActionLog(req.params.instanceId, actionLog._id, false, timestampEnded);

                                res.send(500, {
                                    actionLogId: actionLog._id
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
                            logger.debug('instance IP ==>', instance.instanceIP);
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
                            logger.debug('running chef client');
                            chef.runChefClient(chefClientOptions, function(err, ret) {
                                if (decryptedCredentials.pemFileLocation) {
                                    fileIo.removeFile(decryptedCredentials.pemFileLocation, function(err) {
                                        if (err) {
                                            logger.error("Unable to delete temp pem file =>", err);
                                        } else {
                                            logger.error("temp pem file deleted =>", err);
                                        }
                                    });
                                }
                                onComplete(err, ret);
                            }, onStdOut, onStdErr);
                            res.send(200, {
                                actionLogId: actionLog._id
                            });

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
                                            logger.error("Unable to delete temp pem file =>", err);
                                        } else {
                                            logger.error("temp pem file deleted =>", err);
                                        }
                                    });
                                }
                                onComplete(err, ret);
                            }, onStdOut, onStdErr);
                            logger.debug("Exit get() for /instances/%s/services/%s/%s", req.params.instanceId, req.params.serviceId, req.params.actionType);
                            res.send(200, {
                                actionLogId: actionLog._id
                            });
                        });
                    }
                });
            });
        });
    });


    app.get('/instances/:instanceId/actionLogs', function(req, res) {
        logger.debug("Enter get() for /instances/%s/actionLogs", req.params.instanceId);
        instancesDao.getAllActionLogs(req.params.instanceId, function(err, actionLogs) {
            if (err) {
                logger.error("Failed to fetch ActionLogs: ", err);
                res.send(500);
                return;
            }

            if (actionLogs && actionLogs.length) {
                logger.debug("Enter get() for /instances/%s/actionLogs", req.params.instanceId);
                res.send(actionLogs);
            } else {
                logger.debug("Exit get() for /instances/%s/actionLogs", req.params.instanceId);
                res.send([]);
            }

        });

    });

    app.get('/instances/:instanceId/actionLogs/:logId', function(req, res) {
        logger.debug("Enter get() for /instances/%s/actionLogs/%s", req.params.instanceId, req.params.logId);
        instancesDao.getActionLogById(req.params.instanceId, req.params.logId, function(err, instances) {
            if (err) {
                logger.error("Failed to fetch ActionLog: ", err);
                res.send(500);
                return;
            }

            if (!(instances.length && instances[0].actionLogs && instances[0].actionLogs.length)) {
                res.send(400);
                return;
            } else {
                logger.debug("Exit get() for /instances/%s/actionLogs/%s", req.params.instanceId, req.params.logId);
                res.send(instances[0].actionLogs[0]);
            }

        });

    });

    app.get('/instances/:instanceId/actionLogs/:logId/logs', function(req, res) {
        logger.debug("Enter get() for /instances/%s/actionLogs/%s/logs", req.params.instanceId, req.params.logId);
        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                logger.error("Failed to fetch Instance: ", err);
                res.send(500);
                return;
            }
            if (!instances.length) {
                res.send(400);
                return;
            }

            logsDao.getLogsByReferenceId(req.params.logId, null, function(err, data) {
                if (err) {
                    logger.error("Failed to fetch Logs: ", err);
                    res.send(500);
                    return;
                }
                logger.debug("Exit get() for /instances/%s/actionLogs/%s/logs", req.params.instanceId, req.params.logId);
                res.send(data);
            });

        });

    });

    app.post('/instances/bootstrap', function(req, res) {


    });



};