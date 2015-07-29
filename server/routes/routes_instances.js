/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * May 2015
 */

// This file act as a Controller which contains Instance related all end points.

var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/classes/instance/instance');
var EC2 = require('../lib/ec2.js');
var Chef = require('../lib/chef.js');
var taskstatusDao = require('../model/taskstatus');
var logsDao = require('../model/dao/logsdao.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var Docker = require('../model/docker.js');
var SSH = require('../lib/utils/sshexec');
var appConfig = require('_pr/config');
var usersDao = require('../model/users.js');
var credentialCryptography = require('../lib/credentialcryptography')
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
//var javaSSHWrapper = require('../model/javaSSHWrapper.js');
var errorResponses = require('./error_responses');
var logger = require('_pr/logger')(module);
var waitForPort = require('wait-for-port');
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var ChefClientExecution = require('../model/classes/instance/chefClientExecution/chefClientExecution.js');

var Cryptography = require('../lib/utils/cryptography');


var Task = require('../model/classes/tasks/tasks.js');
var utils = require('../model/classes/utils/utils.js');
var SCPClient = require('../lib/utils/scp');
var shellEscape = require('shell-escape');
//var WINRM = require('../lib/utils/winrmexec');

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

    app.get('/instances/rdp/:vmname/:port', function(req, res) {

        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.vmname + '.rdp');
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
        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                logger.debug("Failed to fetch Instance ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (instances.length) {
                var instance = instances[0];
                Task.getTasksByNodeIds([req.params.instanceId], function(err, tasks) {
                    if (err) {
                        logger.debug("Failed to fetch tasks by node id ", err);
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    console.log('length ==>', tasks.length);
                    if (tasks.length) {
                        res.send(400, {
                            message: "Instance is associated with task"
                        });
                        return;

                    }

                    if (req.query.chefRemove && req.query.chefRemove === 'true') {
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
                                    if (err.chefStatusCode && err.chefStatusCode === 404) {
                                        removeInstanceFromDb();
                                    } else {
                                        res.send(500);
                                    }
                                } else {
                                    removeInstanceFromDb();
                                    logger.debug("Successfully removed instance from db.");
                                }
                            });

                        });
                    } else {
                        removeInstanceFromDb();
                    }

                });
            } else {
                res.send(404, {
                    "message": "Instance does not exist"
                });
            }
        });

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
    });

    app.post('/instances/:instanceId/appUrl', function(req, res) { //function(instanceId, ipaddress, callback)

        instancesDao.addAppUrls(req.params.instanceId, req.body.appUrls, function(err, appUrls) {
            if (err) {
                logger.error("Failed to add appurl", err);
                res.send(500);
                return;
            }
            if (appUrls) {
                res.send(appUrls);
            } else {
                res.send(404);
            }

        });
    });


    app.post('/instances/:instanceId/appUrl/:appUrlId/update', function(req, res) { //function(instanceId, ipaddress, callback)
        logger.debug("Enter post() for /instances/%s/appUrl/update", req.params.instanceId);
        instancesDao.updateAppUrl(req.params.instanceId, req.params.appUrlId, req.body.name, req.body.url, function(err, updateCount) {
            if (err) {
                logger.error("Failed to update appurl", err);
                res.send(500);
                return;
            }
            res.send({
                updateCount: updateCount
            });
        });
    });

    app.delete('/instances/:instanceId/appUrl/:appUrlId', function(req, res) { //function(instanceId, ipaddress, callback)
        logger.debug("Enter post() for /instances/%s/appUrl/update", req.params.instanceId);
        instancesDao.removeAppUrl(req.params.instanceId, req.params.appUrlId, function(err, deleteCount) {
            if (err) {
                logger.error("Failed to remove app url", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            res.send({
                deleteCount: deleteCount
            });
        });
    });

    // add instance task
    app.post('/instances/:instanceId/addTask', function(req, res) {
        if (!(req.body.taskIds && req.body.taskIds.length)) {
            // res.send(404, {
            //     message: "Invalid Task Id"
            // });
            // return;

            req.body.taskIds = [];
        }
        instancesDao.addTaskIds(req.params.instanceId, req.body.taskIds, function(err, updateCount) {
            if (err) {
                logger.error("Failed to add taskIds", err);
                res.send(500);
                return;
            }
            if (updateCount) {
                res.send(200, {
                    updateCount: updateCount
                });
            } else {
                res.send(404);
            }
        });
    });

    app.delete('/instances/:instanceId/removeTask', function(req, res) { //function(instanceId, ipaddress, callback)

        instancesDao.removeTaskId(req.params.instanceId, function(err, deleteCount) {
            if (err) {
                logger.error("Failed to taskId", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            res.send({
                deleteCount: deleteCount
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
        //returning browser handle before execution starts.
        res.send(200);

        _docker.runDockerCommands(cmd, instanceid, function(err, retCode) {
            if (!err) {
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: false,
                    log: "Container  " + req.params.containerid + " Executed :" + req.params.action,
                    timestamp: new Date().getTime()
                });
                logger.debug("Docker Command run Successfully");

                logger.debug("Exit get() for /instances/dockerexecute/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
            } else {
                logger.error("Excute Error : ", err);
                logsDao.insertLog({
                    referenceId: instanceid,
                    err: true,
                    log: "Excute Error : " + err,
                    timestamp: new Date().getTime()
                });
                logger.error("Error hit while running Docker Command: ", err);
                logger.debug("Exit get() for /instances/dockerexecute/%s/%s/%s", req.params.instanceid, req.params.containerid, req.params.action);
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
    app.get('/instances/search/:orgid/:bgid/:projid/:envid/:querytext',function(req,res){
        logger.debug("Enter get() for /instances/search/" + req.params.querytext);
        //constructing the options object to narrow down search
        req.params.querytext = req.params.querytext.replace(/\"/g, '\\"');
        logger.debug('Query:' + req.params.querytext);
        var options = {
            search:req.params.querytext,
            filter:{
                 orgId:req.params.orgid,
                envId:req.params.envid,
                bgId:req.params.bgid ,
                projectId:req.params.projid
            },
           limit: 10000
        }
        logger.debug(JSON.stringify(options));
       // req.params.querytext = '(\"' + req.params.querytext + '\") AND (' + req.params.orgid + ' AND ' + req.params.bgid + ' AND ' + req.params.projid +  ' AND ' + req.params.envid + ')';
        instancesDao.searchInstances(req.params.querytext,options,function(err,data){
            if(!err){
                logger.debug('Received from search');
               logger.debug(data.length);
                res.send(data);
            }
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
    //Coposite Docker container launch 
    app.get('/instances/dockercompositeimagepull/:instanceid/:dockerreponame/:dockercomposejson', function(req, res) {
        var generateDockerLaunchParams = function(runparams) {
            logger.debug('rcvd runparams --->', runparams);
            var launchparams = [];
            var preparams = '';
            var startparams = '';
            var execparam = '';
            var containername = '';

            //eliminating any exec portion.
            var _execp = runparams.split('-exec');
            if (_execp.length > 0 && typeof _execp != 'undefined') {
                execparam = _execp[1];
                runparams = _execp[0];

            }
            if (runparams.indexOf('-c') > 0) {
                var _startparm = runparams.split('-c');
                if (_startparm.length > 0 && typeof _startparm[1] != 'undefined') {
                    startparams = _startparm[1];
                    runparams = _startparm[0];
                }
            }

            logger.debug('1 runparams: ' + runparams);

            var params = runparams.split(' -');



            for (var i = 0; i < params.length; i++) {
                //logger.debug('split runparams --->',params[i]);
                if (params[i] != '') {
                    var itms = params[i].split(' ');
                    if (itms.length > 0) {
                        logger.debug('itms[0]:' + itms[0] + ';itms[1]:' + itms[1]);
                        // if (itms[0] == 'c')
                        //     startparams += ' ' + itms[1];
                        // if (itms[0] == 'exec')
                        //     execparam += ' ' + itms[1];
                        // else
                        preparams += ' -' + params[i];

                        if (itms[0] == '-name') {

                            containername = itms[1];
                        }

                    }

                }
            }
            logger.debug('execparam: ' + execparam);
            logger.debug('runparams: ' + runparams);
            logger.debug('preparams: ' + preparams);
            logger.debug('startparams: ' + startparams);


            launchparams[0] = preparams;
            launchparams[1] = startparams;
            // alert(execparam);
            launchparams[2] = execparam;
            launchparams[3] = containername;
            //alert(launchparams);
            //  logger.debug('launchparams:' + launchparams.join('&&'));
            return (launchparams);
        }

        //:dockerreponame/:imagename/:tagname/:runparams/:startparams
        logger.debug("Enter get() for /instances/dockercompositeimagepull");
        var instanceid = req.params.instanceid;
        var dockercompose = decodeURIComponent(req.params.dockercomposejson);
        var dockercomposejson = JSON.parse(dockercompose);
        logger.debug('DockerCompose Json rcvd: ', JSON.stringify(dockercomposejson));
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
                        var imagecount = 0; //to count the no of images started.
                        var pullandrundocker = function(imagename, tagname, runparams, startparams, execcommand, containername, callback) {
                            imagecount++;
                            var cmd = "sudo docker login -e " + dock.dockeremailid + ' -u ' + dock.dockeruserid + ' -p ' + dock.dockerpassword;

                            //cmd += ' && sudo docker pull ' + dock.dockeruserid  + '/' + decodeURIComponent(req.params.imagename);
                            //removing docker userID
                            cmd += ' && sudo docker pull ' + decodeURIComponent(imagename);
                            logger.debug('Intermediate cmd: ', cmd);
                            if (tagname != null) {
                                cmd += ':' + tagname;
                            }

                            if (runparams != 'null') {
                                runparams = decodeURIComponent(runparams);
                            }

                            if (startparams != 'null') {
                                startparams = decodeURIComponent(startparams);
                            } else
                                startparams = '/bin/bash';

                            cmd += ' && sudo docker run -i -t -d ' + runparams + ' ' + decodeURIComponent(imagename) + ':' + tagname + ' ' + startparams;
                            logger.debug('Docker command to be executed : ', cmd);
                            if (imagecount == 1) {
                                //this would be the first image that would be run. Returning handle to browser.
                                logger.debug('Returning handle to browser');
                                res.end('OK');
                            }
                            //callback('done');
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
                                        logger.debug('Execcommand : --------------' + execcommand + ' ' + (execcommand != ''));
                                        if (execcommand != '' && execcommand != 'null') {
                                            logger.debug('In Execute command');
                                            logsDao.insertLog({
                                                referenceId: instanceid,
                                                err: false,
                                                log: 'Starting execute command: . cmd : ' + execcommand + ' on ' + containername,
                                                timestamp: new Date().getTime()
                                            });
                                            //Execute command found 
                                            var cmd = "sudo docker exec " + containername + ' bash ' + execcommand;
                                            logger.debug('In docker exec ->' + cmd);
                                            req.params.containerid = containername;
                                            _docker.runDockerCommands(cmd, req.params.instanceid, function(err, retCode1) {
                                                if (retCode1 == 0) {

                                                    logger.debug('runDockerCommand : in done');
                                                    instancesDao.updateInstanceDockerStatus(instanceid, "success", '', function(data) {
                                                        logger.debug('Instance Docker Status set to Success');
                                                        // res.send(200);
                                                        //callback('done');
                                                        logsDao.insertLog({
                                                            referenceId: instanceid,
                                                            err: false,
                                                            log: 'Done execute command: . cmd : ' + cmd + ' on ' + containername,
                                                            timestamp: new Date().getTime()
                                                        });
                                                        if (imagecount < dockercomposejson.length) {

                                                            var lp = generateDockerLaunchParams(dockercomposejson[imagecount]['dockerlaunchparameters']);
                                                            var startparams = 'null';
                                                            var execcommand = 'null';
                                                            if (lp.length > 0) {
                                                                if (lp[1]) {
                                                                    startparams = lp[1];
                                                                }
                                                                if (lp[2]) {
                                                                    execcommand = lp[2];
                                                                }
                                                            }
                                                            logger.debug('Running pullandrun count:', imagecount);
                                                            pullandrundocker(dockercomposejson[imagecount]['dockercontainerpaths'], dockercomposejson[imagecount]['dockerrepotags'], lp[0], startparams, execcommand, lp[3]);
                                                        }
                                                    });
                                                } else {
                                                    logsDao.insertLog({
                                                        referenceId: instanceid,
                                                        err: true,
                                                        log: 'Error executing command: . cmd : ' + cmd + ' on ' + containername + ' : Return Code ' + retCode1 + ' -' + err,
                                                        timestamp: new Date().getTime()
                                                    });
                                                }

                                            });
                                            // logger('runout :' + runout);

                                        } else //no exec commands found
                                        {
                                            instancesDao.updateInstanceDockerStatus(instanceid, "success", '', function(data) {
                                                logger.debug('Instance Docker Status set to Success');
                                                // res.send(200);
                                                //callback('done');
                                                logsDao.insertLog({
                                                    referenceId: instanceid,
                                                    err: false,
                                                    log: 'Done executing command: . cmd : ' + cmd,
                                                    timestamp: new Date().getTime()
                                                });
                                                if (imagecount < dockercomposejson.length) {

                                                    var lp = generateDockerLaunchParams(dockercomposejson[imagecount]['dockerlaunchparameters']);
                                                    logger.debug('lp returned from generate=======> ', lp.join(' &&'));
                                                    var startparams = 'null';
                                                    var execcommand = 'null';
                                                    if (lp.length > 0) {
                                                        if (lp[1]) {
                                                            startparams = lp[1];
                                                        }
                                                        if (lp[2]) {
                                                            execcommand = lp[2];
                                                        }
                                                    }
                                                    logger.debug('Running pullandrun count:', imagecount);
                                                    pullandrundocker(dockercomposejson[imagecount]['dockercontainerpaths'], dockercomposejson[imagecount]['dockerrepotags'], lp[0], startparams, execcommand, lp[3]);
                                                }
                                            });
                                        }
                                        //Running any execute command.
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
                                    //res.send(stdOutErr);

                                });
                        };

                        if (dockercomposejson.length > 0) {
                            var lp = generateDockerLaunchParams(dockercomposejson[0]['dockerlaunchparameters']);

                            var startparams = 'null';
                            var execcommand = 'null';
                            if (lp.length > 0) {
                                if (lp[1]) {
                                    startparams = lp[1];
                                }
                                if (lp[2]) {
                                    execcommand = lp[2];
                                }
                            }
                            logger.debug('lp---->', lp[0]);
                            pullandrundocker(dockercomposejson[0]['dockercontainerpaths'], dockercomposejson[0]['dockerrepotags'], lp[0], startparams, execcommand, lp[3]);
                        } else {
                            res.send('200 ' + 'No Images to pull');
                        }





                    } //!(err)
                });
            } else {
                logger.debug('No Instance found with id : ' + instanceid);
                res.send(500);
                return;
            }
        });

    });
    app.post('/instances/:instanceId/updateRunlist', function(req, res) {
        logger.debug("InstanceID>>>>>>>>>>> ", req.params.instanceId);
        if (req.session.user.rolename === 'Consumer') {
            res.send(401);
            return;
        }
        logger.debug("Enter post() for /instances/updateRunlist");
        if (!req.body.runlist) {
            res.send(400);
            return;
        }
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>>> ", req.body.runlist);
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
                                        log: "Chef information is corrupt. Chef run failed",
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


                                    //getting chef run execution Id 

                                    ChefClientExecution.createNew({
                                        instanceId: instance.id

                                    }, function(err, chefClientExecution) {
                                        if (err) {
                                            var timestampEnded = new Date().getTime();
                                            logsDao.insertLog({
                                                referenceId: logReferenceIds,
                                                err: true,
                                                log: "Unable to generate chef run execution id. Chef run failed",
                                                timestamp: timestampEnded
                                            });
                                            instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
                                            return;
                                        }

                                        // creating json attribute for execution id
                                        var jsonAttributeObj = {
                                            catalyst_attribute_handler: {
                                                catalystCallbackUrl: req.protocol + '://' + req.get('host') + '/chefClientExecution/' + chefClientExecution.id
                                            }
                                        };

                                        var attributeObj = {};
                                        if (req.body.jsonAttributes && req.body.jsonAttributes.length) {
                                            var objectArray = [];
                                            for (var i = 0; i < req.body.jsonAttributes.length; i++) {
                                                objectArray.push(req.body.jsonAttributes[i].jsonObj);
                                            }
                                            attributeObj = utils.mergeObjects(objectArray);
                                            console.log('json ==> ', attributeObj);
                                        } else {
                                            req.body.jsonAttributes = [];
                                        }
                                        jsonAttributeObj = utils.mergeObjects([attributeObj, jsonAttributeObj]);


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
                                            overrideRunlist: false,
                                            jsonAttributes: JSON.stringify(jsonAttributeObj)
                                            //parallel:true
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
                                        logger.debug("=============================== ", JSON.stringify(chef));
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
                                                instancesDao.updateInstancesRunlistAndAttributes(req.params.instanceId, req.body.runlist, req.body.jsonAttributes, function(err, updateCount) {
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
                        logger.debug("data.providerId: ::::   ", JSON.stringify(data[0]));
                        if (data.length) {
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

                            if (!data[0].providerId) {
                                res.send(500, {
                                    message: "Insufficient provider details, to complete the operation"
                                });
                                logsDao.insertLog({
                                    referenceId: logReferenceIds,
                                    err: true,
                                    log: "Insufficient provider details, to complete the operation",
                                    timestamp: new Date().getTime()
                                });
                                return;
                            }
                            AWSProvider.getAWSProviderById(data[0].providerId, function(err, aProvider) {
                                if (err) {
                                    logger.error(err);
                                    res.send(500, "Unable to get Provider.");
                                    return;
                                }
                                logger.debug("Provider:>>>>>>>>>> ", JSON.stringify(aProvider));
                                AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id, function(err, keyPair) {
                                    logger.debug("keyPairs length::::: ", keyPair[0].region);
                                    if (err) {
                                        res.send(500, "Error getting to fetch Keypair.")
                                    }
                                    var cryptoConfig = appConfig.cryptoSettings;
                                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                    var keys = [];
                                    keys.push(aProvider.accessKey);
                                    keys.push(aProvider.secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.sned(500, "Failed to decrypt accessKey or secretKey");
                                            return;
                                        }

                                        var ec2 = new EC2({
                                            "access_key": decryptedKeys[0],
                                            "secret_key": decryptedKeys[1],
                                            "region": keyPair[0].region
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
                                AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id, function(err, keyPair) {
                                    logger.debug("keyPairs length::::: ", keyPair[0].region);
                                    if (err) {
                                        res.send(500, "Error getting to fetch Keypair.")
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

                                    var cryptoConfig = appConfig.cryptoSettings;
                                    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                    var keys = [];
                                    keys.push(aProvider.accessKey);
                                    keys.push(aProvider.secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.sned(500, "Failed to decrypt accessKey or secretKey");
                                            return;
                                        }

                                        var ec2 = new EC2({
                                            "access_key": decryptedKeys[0],
                                            "secret_key": decryptedKeys[1],
                                            "region": keyPair[0].region
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

                        if (updateCount && (typeof updateCount === 'Object' || typeof updateCount === 'object') && updateCount.n) {
                            updateCount = updateCount.n;
                        }
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
                    if (serviceData.commandtype === "Chef Cookbook/Recipe") {
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
                                //parallel:true
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
                            sshParamObj.privateKey = decryptedCredentials.pemFileLocation;
                        } else {
                            sshParamObj.password = decryptedCredentials.password;
                        }

                        var serviceCmd = "service " + serviceData.command + " " + req.params.actionType;
                        var sudoCmd = "sudo";
                        if (options.password) {
                            sudoCmd = 'echo \"' + options.password + '\" | sudo -S';
                        }
                        serviceCmd = sudoCmd + " " + serviceCmd;


                        var sshConnection = new SSH(sshParamObj);

                        sshConnection.exec(serviceCmd, function(err, ret) {
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
            var timestamp = null;
            if (req.query.timestamp) {
                timestamp = req.query.timestamp;
                timestamp = parseInt(timestamp);
            }

            logsDao.getLogsByReferenceId(req.params.logId, timestamp, function(err, data) {
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

    app.post('/instances/:instanceId/updateName', function(req, res) {
        logger.debug("Enter post() for /instances/%s/updateName", req.params.instanceId);
        instancesDao.getInstanceById(req.params.instanceId, function(err, anInstance) {
            if (err) {
                logger.error("Failed to fetch Instance: ", err);
                res.send(500, "Failed to fetch Instance: ");
                return;
            }
            if (anInstance) {
                instancesDao.updateInstanceName(req.params.instanceId, req.body.name, function(err, updateCount) {
                    if (err) {
                        res.send(500, "Failed to update instance name");
                        return;
                    }
                    console.log(updateCount);
                    res.send(200, {
                        updateCount: updateCount
                    });
                });

            } else {
                res.send(404, "No Instance found.")
            }

        });

    });

    app.get('/instances/:instanceId/inspect', function(req, res) {
        logger.debug("Enter get() for /instances/%s/inspect", req.params.instanceId);
        instancesDao.getInstanceById(req.params.instanceId, function(err, anInstance) {
            if (err) {
                logger.error("Failed to fetch Instance: ", err);
                res.send(500, "Failed to fetch Instance: ");
                return;
            }

            logger.debug("Return instance>>>>>>>>>>> ", JSON.stringify(anInstance));
            if (anInstance.length) {
                if (anInstance[0].bootStrapStatus !== 'success') {
                    res.send(400, {
                        message: "Instance is not boostraped"
                    });
                    return;
                }
                configmgmtDao.getChefServerDetails(anInstance[0].chef.serverId, function(err, chefDetails) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (!chefDetails) {
                        res.send(404);
                        return;
                    }

                    //decrypting pem file
                    credentialCryptography.decryptCredential(anInstance[0].credentials, function(err, decryptedCredentials) {
                        if (err) {
                            res.send(500, "Unable to decrypt file.");
                            return;
                        }

                        //getting chef run execution Id 
                        if (anInstance[0].hardware.os == 'linux') {
                            var cmd = 'dpkg --get-selections';
                            if (anInstance[0].hardware.platform === 'centos') {
                                cmd = 'rpm -qa';
                            }
                            var sudoCmd = "sudo";
                            if (decryptedCredentials.password) {
                                sudoCmd = 'echo \"' + decryptedCredentials.password + '\" | sudo -S';
                            }
                            cmd = sudoCmd + " " + cmd;

                            var sshParamObj = {
                                username: decryptedCredentials.username,
                                host: anInstance[0].instanceIP,
                                port: 22
                            }
                            if (decryptedCredentials.pemFileLocation) {
                                sshParamObj.privateKey = decryptedCredentials.pemFileLocation;
                            } else {
                                sshParamObj.password = decryptedCredentials.password;
                            }
                            var sshConnection = new SSH(sshParamObj);
                            var installedSoftwareString = '';
                            sshConnection.exec(cmd, function(err, retCode) {
                                if (err) {
                                    res.send(500, {
                                        "message": "Unable to ssh"
                                    });
                                    return;
                                }
                                if (retCode == 0) {
                                    res.send(200, {
                                        installedSoftwareString: installedSoftwareString
                                    });
                                } else if (retCode === -5000) {
                                    res.send(500, {
                                        "message": "Host Unreachable."
                                    });
                                    return;
                                } else if (retCode === -5001) {
                                    res.send(500, {
                                        "message": "Invalid credentials."
                                    });
                                    return;
                                } else if (retCode === -5002) {
                                    res.send(500, {
                                        "message": "Unknown Exeption Occured. Code : " + retCode
                                    });
                                    return;
                                } else {
                                    res.send(500, {
                                        "message": "Unknown Exeption Occured. Code : " + retCode
                                    });
                                    return;
                                }

                            }, function(stdOut) {
                                installedSoftwareString = installedSoftwareString + stdOut.toString('UTF-8');
                            }, function(stdErr) {

                            });

                        } else {


                            var chef = new Chef({
                                userChefRepoLocation: chefDetails.chefRepoLocation,
                                chefUserName: chefDetails.loginname,
                                chefUserPemFile: chefDetails.userpemfile,
                                chefValidationPemFile: chefDetails.validatorpemfile,
                                hostedChefUrl: chefDetails.url,
                            });
                            var chefClientOptions = {
                                username: decryptedCredentials.username,
                                host: anInstance[0].instanceIP,
                                port: 22,
                            }

                            if (decryptedCredentials.pemFileLocation) {
                                chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                            } else {
                                chefClientOptions.password = decryptedCredentials.password;
                            }
                            var installedSoftwareString = '';
                            var cmd = 'Get-WmiObject -Class Win32_Product | Select-Object -Property Name';
                            cmd = 'powershell \"' + cmd + '\"';
                            chef.runKnifeWinrmCmd(cmd, chefClientOptions, function(err, retCode) {

                                if (err) {
                                    res.send(500, {
                                        "message": "Unable to winrm"
                                    });
                                    return;
                                }
                                logger.debug("Winrm finished with retcode ==> " + retCode);
                                if (retCode == 0) {
                                    installedSoftwareString = installedSoftwareString.replace(new RegExp(anInstance[0].instanceIP, 'g'), '');
                                    //removing first two lines of junk
                                    var stringParts = installedSoftwareString.split('\n');
                                    if (stringParts.length > 4) { // must be greater than 3
                                        stringParts = stringParts.slice(4);
                                        installedSoftwareString = stringParts.join('\r\n');
                                    } else { //returning empty string
                                        installedSoftwareString = '';
                                    }
                                    res.send(200, {
                                        installedSoftwareString: installedSoftwareString
                                    });
                                } else if (retCode === -5000) {
                                    res.send(500, {
                                        "message": "Host Unreachable."
                                    });
                                    return;
                                } else if (retCode === -5001) {
                                    res.send(500, {
                                        "message": "Invalid credentials."
                                    });
                                    return;
                                } else if (retCode === -5002) {
                                    res.send(500, {
                                        "message": "Unknown Exeption Occured while trying knife winrm. Code : " + retCode
                                    });
                                    return;
                                } else {
                                    res.send(500, {
                                        "message": "Unknown Exeption Occured while trying knife winrm. Code : " + retCode
                                    });
                                    return;
                                }
                            }, function(stdOut) {
                                installedSoftwareString = installedSoftwareString + stdOut.toString('UTF-8');

                            }, function(stdErr) {
                                logger.debug("err ==> " + stdErr.toString('ascii'));
                            });

                        }
                    });
                });

            } else {
                res.send(404, "No Instance found.");
                return;
            }

        });

    });
    /*
    app.get('/instances/:instanceId/setAsWorkStation', function(req, res) {

        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                logger.debug("Failed to fetch Instance ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!instances.length) {
                return res.send(404, {
                    message: "Instance does not exist"
                });

            }

            var instance = instances[0];
            configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                if (err) {
                    logger.debug("Failed to fetch ChefServerDetails ", err);
                    res.send(500, errorResponses.chef.corruptChefData);
                    return;
                }
                credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                    if (err) {
                        res.send(500, {
                            "message": "Unable to decrypt file."
                        });
                        return;
                    }
                    var params = {
                        username: decryptedCredentials.username,
                        host: instance.instanceIP,
                        port: 22
                    };

                    if (decryptedCredentials.pemFileLocation) {
                        params.privateKey = decryptedCredentials.pemFileLocation;
                    } else {
                        params.password = decryptedCredentials.password;
                    }
                    var scpClient = new SCPClient(params);
                    scpClient.upload(chefDetails.chefRepoLocation + '/.chef/', '/home/' + decryptedCredentials.username + '/' + instance.chef.chefNodeName + '/.chef/', function(err) {
                        if (err) {
                            console.log(err);
                            res.send(500, err);
                            return;
                        }
                        res.send(200, {
                            message: 'true'
                        })
                    });
                });

            });
        });
    });*/

    app.get('/instances/:instanceId/setAsWorkStation', function(req, res) {

        instancesDao.getInstanceById(req.params.instanceId, function(err, instances) {
            if (err) {
                logger.debug("Failed to fetch Instance ", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!instances.length) {
                return res.send(404, {
                    message: "Instance does not exist"
                });

            }

            var instance = instances[0];
            configmgmtDao.getChefServerDetails(instance.chef.serverId, function(err, chefDetails) {
                if (err) {
                    logger.debug("Failed to fetch ChefServerDetails ", err);
                    res.send(500, errorResponses.chef.corruptChefData);
                    return;
                }
                credentialCryptography.decryptCredential(instance.credentials, function(err, decryptedCredentials) {
                    if (err) {
                        res.send(500, {
                            "message": "Unable to decrypt file."
                        });
                        return;
                    }
                    var params = {
                        username: decryptedCredentials.username,
                        host: instance.instanceIP,
                        port: 22
                    };

                    if (decryptedCredentials.pemFileLocation) {
                        params.privateKey = decryptedCredentials.pemFileLocation;
                    } else {
                        params.password = decryptedCredentials.password;
                    }
                    var remotePath;
                    if (instance.hardware.os === 'linux') {
                        remotePath = '$HOME/$HOSTNAME/.chef/';
                    } else {
                        remotePath = "C:\\Users\\" + params.username + '\\' + instance.chef.chefNodeName + '\\.chef\\';
                    }

                    function createCmdString(fileItem, cmdString, callback) {
                        if (cmdString) {
                            cmdString = cmdString + ' && '
                        }
                        fileIo.readFile(fileItem.fullPath, function(err, fileData) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            var args = ['echo', fileData.toString()];

                            var escapedString = shellEscape(args);
                            var sudoCmd = '';
                            // if (instance.hardware.os === 'linux') {
                            //     sudoCmd = "sudo sh -c \"";
                            //     if (decryptedCredentials.password) {
                            //         sudoCmd = 'echo \"' + decryptedCredentials.password + '\" | sudo -S ';
                            //     }
                            //     escapedString = sudoCmd + escapedString + ' > ' + remotePath + fileItem.name+"\"";
                            // } else {
                            //     escapedString = sudoCmd + escapedString + ' > ' + remotePath + fileItem.name;
                            // }
                            escapedString = sudoCmd + escapedString + ' > ' + remotePath + fileItem.name;


                            cmdString = cmdString + escapedString;
                            callback(null, cmdString);

                        });
                    }

                    fileIo.readDir('', chefDetails.chefRepoLocation + '/.chef/', function(err, dirList, fileList) {
                        if (err) {
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                        var count = 0;

                        function loopFiles(fileList, cmdString, callback) {

                            if (count < fileList.length) {
                                createCmdString(fileList[count], cmdString, function(err, cmdString) {
                                    count++;
                                    if (err) {
                                        res.send(500, errorResponses.db.error);
                                        return;
                                    }
                                    loopFiles(fileList, cmdString, callback);
                                });
                            } else {
                                callback(cmdString);

                            }
                        }
                        if (fileList.length) {
                            loopFiles(fileList, '', function(cmdString) {

                                if (instance.hardware.os === 'linux') {
                                    var sudoCmd = '';
                                    // var sudoCmd = "sudo";
                                    // if (decryptedCredentials.password) {
                                    //     sudoCmd = 'echo \"' + decryptedCredentials.password + '\" | sudo -S';
                                    // }
                                    var cmd = sudoCmd + " mkdir -p " + remotePath + ' && ' + cmdString;

                                    var sshParamObj = {
                                        username: decryptedCredentials.username,
                                        host: instance.instanceIP,
                                        port: 22
                                    }
                                    if (decryptedCredentials.pemFileLocation) {
                                        sshParamObj.privateKey = decryptedCredentials.pemFileLocation;
                                    } else {
                                        sshParamObj.password = decryptedCredentials.password;
                                    }
                                    var sshConnection = new SSH(sshParamObj);
                                    console.log(cmd);
                                    sshConnection.exec(cmd, function(err, retCode) {
                                        if (err) {
                                            res.send(500, {
                                                "message": "Unable to ssh"
                                            });
                                            return;
                                        }
                                        if (retCode == 0) {
                                            res.send(200, {
                                                "message": "true"
                                            });
                                        } else if (retCode === -5000) {
                                            res.send(500, {
                                                "message": "Host Unreachable."
                                            });
                                            return;
                                        } else if (retCode === -5001) {
                                            res.send(500, {
                                                "message": "Invalid credentials."
                                            });
                                            return;
                                        } else if (retCode === -5002) {
                                            res.send(500, {
                                                "message": "Unknown Exeption Occured. Code : " + retCode
                                            });
                                            return;
                                        } else {
                                            res.send(500, {
                                                "message": "Unknown Exeption Occured. Code : " + retCode
                                            });
                                            return;
                                        }

                                    }, function(stdOut) {
                                        console.log('err ==> ', stdOut.toString());

                                    }, function(stdErr) {
                                        console.log('err ==> ', stdErr.toString());
                                    });

                                } else { //windows

                                    var chef = new Chef({
                                        userChefRepoLocation: chefDetails.chefRepoLocation,
                                        chefUserName: chefDetails.loginname,
                                        chefUserPemFile: chefDetails.userpemfile,
                                        chefValidationPemFile: chefDetails.validatorpemfile,
                                        hostedChefUrl: chefDetails.url,
                                    });
                                    var chefClientOptions = {
                                        username: decryptedCredentials.username,
                                        host: instance.instanceIP,
                                        port: 22,
                                    }

                                    if (decryptedCredentials.pemFileLocation) {
                                        chefClientOptions.privateKey = decryptedCredentials.pemFileLocation;
                                    } else {
                                        chefClientOptions.password = decryptedCredentials.password;
                                    }

                                    chef.runKnifeWinrmCmd('mkdir ' + remotePath + ' && ' + cmdString, chefClientOptions, function(err, retCode) {

                                        if (err) {
                                            res.send(500, {
                                                "message": "Unable to winrm"
                                            });
                                            return;
                                        }
                                        logger.debug("Winrm finished with retcode ==> " + retCode);
                                        if (retCode == 0) {
                                            res.send(200, {
                                                "message": "true"
                                            });
                                        } else if (retCode === -5000) {
                                            res.send(500, {
                                                "message": "Host Unreachable."
                                            });
                                            return;
                                        } else if (retCode === -5001) {
                                            res.send(500, {
                                                "message": "Invalid credentials."
                                            });
                                            return;
                                        } else if (retCode === -5002) {
                                            res.send(500, {
                                                "message": "Unknown Exeption Occured while trying knife winrm. Code : " + retCode
                                            });
                                            return;
                                        } else {
                                            res.send(500, {
                                                "message": "Unknown Exeption Occured while trying knife winrm. Code : " + retCode
                                            });
                                            return;
                                        }
                                    }, function(stdOut) {
                                        installedSoftwareString = installedSoftwareString + stdOut.toString('UTF-8');

                                    }, function(stdErr) {
                                        logger.debug("err ==> " + stdErr.toString('ascii'));
                                    });

                                }

                            });
                        } else {
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                    });
                });

            });
        });
    });



};