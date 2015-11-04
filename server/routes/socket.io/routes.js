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
        //console.log('socket ==>',socket);
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
                        console.log("error ==>", err);
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

    // Sync instance status AWS with Catalyst.

    var jobId = crontab.scheduleJob("*/3 * * * *", function() { //This will call this function every 3 minutes 
        logger.debug("Cron Job run every 3 minutes!");
        var instanceState = socketIo.of('/insState');
        var socketList = [];
        instancesDao.getAllInstances(function(err, instances) {
            if (err) {
                logger.debug("Error while getElementBytting instance!");
            }

            if (instances.length > 0) {
                for (var ins = 0; ins < instances.length; ins++) {
                    (function(ins) {
                        //proceed only if the instance is part of the aws provider
                        if (instances[ins].providerId) {
                            var instanceIds = [];
                            AWSProvider.getAWSProviderById(instances[ins].providerId, function(err, aProvider) {
                                if (err) {
                                    logger.debug("Failed to get Provider!");
                                }
                                logger.debug("Got Provider: ", JSON.stringify(aProvider));
                                if (aProvider) {
                                    AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id, function(err, aKeyPair) {
                                        if (err) {
                                            logger.debug("Failed to get KeyPair!");
                                        }
                                        logger.debug("Got KeyPair: ");
                                        if (aKeyPair) {
                                            var cryptoConfig = appConfig.cryptoSettings;
                                            var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
                                            var keys = [];
                                            keys.push(aProvider.accessKey);
                                            keys.push(aProvider.secretKey);
                                            cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                                if (err) {
                                                    res.send(500, "Failed to decrypt accessKey or secretKey");
                                                    return;
                                                }
                                                var ec2 = new EC2({
                                                    "access_key": decryptedKeys[0],
                                                    "secret_key": decryptedKeys[1],
                                                    "region": aKeyPair[0].region
                                                });
                                                logger.debug("AWS ec2: ", JSON.stringify(ec2));
                                                instanceIds.push(instances[ins].platformId);
                                                ec2.describeInstances(instanceIds, function(err, awsInstances) {
                                                    if (err) {
                                                        if (err.statusCode === 400) {
                                                            logger.debug("Failed to describe Instances from AWS!", err);
                                                            instancesDao.updateInstanceState(instances[ins]._id, "terminated", function(err, data) {
                                                                if (err) {
                                                                    logger.error("Failed to updateInstance State!", err);
                                                                }

                                                                logger.debug("Exit updateInstanceState: ");
                                                            });
                                                        }
                                                    }
                                                    //logger.debug("Described Instances from AWS: ", JSON.stringify(awsInstances));
                                                    if (awsInstances) {
                                                        var reservations = awsInstances.Reservations;
                                                        for (var x = 0; x < reservations.length; x++) {
                                                            if (instances[ins].instanceState === reservations[x].Instances[0].State.Name) {
                                                                logger.debug("Status matched......");
                                                            } else {
                                                                logger.debug("Status does not matched.....", instances[ins]._id);
                                                                instancesDao.updateInstanceState(instances[ins]._id, reservations[x].Instances[0].State.Name, function(err, data) {
                                                                    if (err) {
                                                                        logger.error("Failed to updateInstance State!", err);
                                                                    }

                                                                    logger.debug("Exit updateInstanceState: ");
                                                                });
                                                            }
                                                        }
                                                    }

                                                });
                                            });
                                        }
                                    });
                                }
                            });
                            //get instance  from id
                            /**
                            var thisinstance = function(instanceid, callback) {
                                //    logger.debug('get instance thisinstance called');
                                for (var i = 0; i < instances.length; i++) {
                                    if (instances[i]._id == instanceid) {
                                        //   logger.debug('found match:',i,instanceid,instances[i]._id );
                                        callback(instances[i]);
                                        break;
                                    }
                                }
                            }

                            //get all vmware providers
                            instances = JSON.parse(JSON.stringify(instances));
                            //to be removed when in dc.
                            return;
                            vmwareProvider.getvmwareProviders(function(err, aProvider) {
                                if (err) {
                                    logger.debug("Failed to get Provider!");
                                }
                                //logger.debug("Got vmware Provider: ", JSON.stringify(aProvider));
                                aProvider = JSON.parse(JSON.stringify(aProvider));
                                if (aProvider) {

                                    //proceed only if the instance is part of the aws provider
                                    for (var ap = 0; ap < aProvider.length; ap++) {
                                        //loop to eliminate instances that are not part of the provider
                                        var instanceIds = [];
                                        //filtering by provider
                                        for (var i = 0; i < instances.length; i++) {
                                            if (instances[i].platformId && instances[i].providerId) {
                                                //add only if provider matches
                                                if (instances[i].providerId == aProvider[ap]._id)
                                                    instanceIds.push(instances[i]._id);
                                                // else
                                                //     logger.debug('Instance does not belong to provider(instance providerid,providerid):',instances[i].providerId,aProvider[ap]._id);
                                            }
                                        }

                                        if (instanceIds.length <= 0) {
                                            continue; //skip next steps if not part of provider.
                                        } else {
                                            logger.debug('Instances matching vmware provider:', instanceIds);
                                            //get all instances running on the vmware server
                                            var vmwareCloud = new VmwareCloud(aProvider[ap]);

                                            vmwareCloud.getVms(appConfig.vmware.serviceHost, function(err, vmsonhost) {
                                                if (!err) {

                                                    vmsonhost = JSON.parse(JSON.stringify(JSON.parse(vmsonhost)));
                                                    //  logger.debug('vmsonhost:',JSON.stringify(vmsonhost));
                                                    for (var i = 0; i < instanceIds.length; i++) {
                                                        // logger.debug('Instance Details');
                                                        //"toolsStatus":"guestToolsRunning","state":"poweredOn"
                                                        for (var j = 0; j < vmsonhost["vms"].length; j++) {
                                                            //   logger.debug('VMState:',vmsonhost.vms[j]["state"]);
                                                            if (vmsonhost.vms[j]["state"] == "poweredOn") {
                                                                thisinstance(instanceIds[i], function(thisinst) {
                                                                    if (thisinst) {
                                                                        if (thisinst.instanceState != 'running') {
                                                                            instancesDao.updateInstanceState(thisinst._id, 'running', function(err, data) {
                                                                                if (err) {
                                                                                    logger.error("Failed to updateInstance State!", err);
                                                                                    callback(err, null);
                                                                                    return;
                                                                                }
                                                                                // logger.debug("Exit updateInstanceState: running ");
                                                                            });
                                                                        }
                                                                    }

                                                                });
                                                            } else {
                                                                thisinstance(instanceIds[i], function(thisinst) {
                                                                    if (thisinst) {
                                                                        if (thisinst.instanceState == 'running') {
                                                                            instancesDao.updateInstanceState(thisinst._id, 'stopped', function(err, data) {
                                                                                if (err) {
                                                                                    logger.error("Failed to updateInstance State!", err);
                                                                                    callback(err, null);
                                                                                    return;
                                                                                }
                                                                                //    logger.debug("Exit updateInstanceState: stopped");
                                                                            });
                                                                        }
                                                                    }

                                                                });
                                                            }

                                                        }
                                                    }
                                                } else {
                                                    logger.debug("Failed to describe Instances from vmware host!", err);

                                                }
                                            });

                                        }

                                    }
                                }

                            }); **/
                        }
                    })(ins);
                } // instance for loop

            }
        });
    });


};
