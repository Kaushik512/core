/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */

var instancesDao = require('../../model/classes/instance/instance.js');
var shellClient = require('../../lib/utils/sshshell');
var logger = require('_pr/logger')(module);
var logsDao = require('../../model/dao/logsdao.js');

var crontab = require('node-crontab');
var AWSProvider = require('../../model/classes/masters/cloudprovider/awsCloudProvider.js');
var vmwareProvider = require('../../model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var VmwareCloud = require('_pr/lib/vmware.js');

var AWSKeyPair = require('../../model/classes/masters/cloudprovider/keyPair.js');
var EC2 = require('../../lib/ec2.js');
var appConfig = require('_pr/config');
var Cryptography = require('../../lib/utils/cryptography');


module.exports.setRoutes = function(socketIo) {

    var sshShell = socketIo.of('/sshShell');

    var socketList = [];

    sshShell.on('connection', function(socket) {
        socketList.push[socket];
        //logger.debug('socket ==>',socket);
        socket.on('open', function(instanceData) {
            logger.debug("instanceData:", instanceData);
            instancesDao.getInstanceById(instanceData.id, function(err, instances) {
                logger.debug(instanceData.id);
                if (err) {
                    logger.error(err);
                    socket.emit('conErr', {
                        message: "Invalid instance Id"
                    });
                    return;
                }
                if (!instances.length) {
                    socket.emit('conErr', {
                        message: "Invalid instance Id"
                    });
                    return;
                }
                var instance = instances[0]
                    // create ssh session with the instance
                var timestampStarted = new Date().getTime();

                var actionLog = instancesDao.insertSSHActionLog(instance._id, instanceData.username, instanceData.sessionUser, timestampStarted);

                var logReferenceIds = [instance._id];

                logReferenceIds.push(actionLog._id);
                logsDao.insertLog({
                    referenceId: logReferenceIds,
                    err: false,
                    log: "Initiating SSH Shell Connection",
                    timestamp: timestampStarted
                });

                shellClient.open({
                    host: instance.instanceIP,
                    port: 22,
                    username: instanceData.username,
                    password: instanceData.password,
                    pemFileData: instanceData.pemFileData
                }, function(err, shell) {
                    var timestampEnded = new Date().getTime();
                    if (err) {
                        socket.shellInstance = null;
                        logger.debug("error ==>", err);
                        if (err.errCode === -5000) {
                            socket.emit('conErr', {
                                message: "Host Unreachable",
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "Host Unreachable",
                                timestamp: timestampEnded
                            });
                        } else if (err.errCode === -5001) {
                            socket.emit('conErr', {
                                message: "The username or password/pemfile you entered is incorrect",
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "The username or password/pemfile you entered is incorrect",
                                timestamp: timestampEnded
                            });
                        } else {
                            socket.emit('conErr', {
                                message: "Unable to connect to instance, error code = " + err.errCode,
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "Unable to connect to instance, error code = " + err.errCode + ".",
                                timestamp: timestampEnded
                            });
                        }
                        instancesDao.updateActionLog(instance._id, actionLog._id, false, timestampEnded);
                        return;
                    }
                    socket.shellInstance = shell;
                    shell.on('data', function(data) {
                        socket.emit('out', {
                            res: data
                        });
                    });
                    shell.on('close', function() {
                        socket.shellInstance = null;
                        socket.emit('close');
                    });
                    shell.on('end', function() {
                        socket.shellInstance = null;
                        socket.emit('close');
                    });

                    shell.on('error', function(err) {
                        socket.shellInstance = null;
                        if (err.errCode === -5000) {
                            socket.emit('conErr', {
                                message: "Host Unreachable",
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "Host Unreachable",
                                timestamp: timestampEnded
                            });
                        } else if (err.errCode === -5001) {
                            socket.emit('conErr', {
                                message: "The username or password/pemfile you entered is incorrect",
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "The username or password/pemfile you entered is incorrect",
                                timestamp: timestampEnded
                            });
                        } else {
                            socket.emit('conErr', {
                                message: "Something went wrong, error code = " + err.errCode,
                                actionLogId: actionLog._id
                            });
                            logsDao.insertLog({
                                referenceId: logReferenceIds,
                                err: true,
                                log: "Something went wrong, error code = " + err.errCode + ".",
                                timestamp: timestampEnded
                            });
                        }
                    });

                    socket.emit('opened', {
                        actionLogId: actionLog._id
                    });
                    logsDao.insertLog({
                        referenceId: logReferenceIds,
                        err: false,
                        log: "SSH Shell initiated",
                        timestamp: timestampEnded
                    });
                    instancesDao.updateActionLog(instance._id, actionLog._id, true, timestampEnded);
                });
            });
        });

        socket.on('cmd', function(data) {

            if (socket.shellInstance) {
                socket.shellInstance.write(data);
            }
        });

        socket.on('close', function() {
            if (socket.shellInstance) {
                socket.shellInstance.close();
                socket.shellInstance = null;
            }
        });

        socket.on('disconnect', function() {
            if (socket.shellInstance) {
                socket.shellInstance.close();
                socket.shellInstance = null;
            }
        });

    });

    

};
