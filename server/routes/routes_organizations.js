var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/blueprints');

var instancesDao = require('../model/dao/instancesdao');
var tasksDao = require('../model/tasks');
var appConfig = require('../config/app_config');
var logger = require('../lib/logger')(module);
var uuid = require('node-uuid');
var fileIo = require('../lib/utils/fileio');
var logsDao = require('../model/dao/logsdao.js');


var credentialCryptography = require('../lib/credentialcryptography');


module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/organizations/*', sessionVerification);


    app.get('/organizations/getTree', function(req, res) {
        masterjsonDao.getMasterJson("1", function(err, orgsJson) {
            if (err) {
                res.send(500);
                return;
            }
            var orgTree = [];

            if (orgsJson.masterjson && orgsJson.masterjson.rows && orgsJson.masterjson.rows.row) {
                for (var i = 0; i < orgsJson.masterjson.rows.row.length; i++) {
                    for (var j = 0; j < orgsJson.masterjson.rows.row[i].field.length; j++) {
                        if (orgsJson.masterjson.rows.row[i].field[j].name = "orgname") {
                            orgTree.push({
                                name: orgsJson.masterjson.rows.row[i].field[j].values.value,
                                businessGroups: [],
                                environments: []
                            });
                            break;
                        }
                    }
                }

                masterjsonDao.getMasterJson("2", function(err, buJson) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                        for (var i = 0; i < orgTree.length; i++) {
                            for (var j = 0; j < buJson.masterjson.rows.row.length; j++) {
                                var isFilterdRow = false;
                                var orgname = '';
                                for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                    if (buJson.masterjson.rows.row[j].field[k].name == "orgname") {
                                        if (orgTree[i].name == buJson.masterjson.rows.row[j].field[k].values.value) {
                                            isFilterdRow = true;
                                            break;
                                        }
                                    }
                                }
                                if (isFilterdRow) {
                                    for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                        if (buJson.masterjson.rows.row[j].field[k].name == "productgroupname") {
                                            orgTree[i].businessGroups.push({
                                                name: buJson.masterjson.rows.row[j].field[k].values.value,
                                                projects: []
                                            });
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        //getting projects 
                        masterjsonDao.getMasterJson("4", function(err, buJson) {
                            if (err) {
                                res.send(500);
                                return;
                            }
                            if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                                for (var i = 0; i < orgTree.length; i++) {
                                    if (orgTree[i].businessGroups.length) {
                                        var businessGroups = orgTree[i].businessGroups;
                                        for (var j = 0; j < businessGroups.length; j++) {
                                            for (var k = 0; k < buJson.masterjson.rows.row.length; k++) {
                                                var isFilterdRow = false;
                                                for (var l = 0; l < buJson.masterjson.rows.row[k].field.length; l++) {
                                                    if (buJson.masterjson.rows.row[k].field[l].name == "productgroupname") {
                                                        if (businessGroups[j].name == buJson.masterjson.rows.row[k].field[l].values.value) {
                                                            isFilterdRow = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isFilterdRow) {
                                                    for (var l = 0; l < buJson.masterjson.rows.row[k].field.length; l++) {
                                                        if (buJson.masterjson.rows.row[k].field[l].name == "projectname") {
                                                            businessGroups[j].projects.push(buJson.masterjson.rows.row[k].field[l].values.value);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }

                                }
                                //getting environments
                                masterjsonDao.getMasterJson("3", function(err, buJson) {
                                    if (err) {
                                        res.send(500);
                                        return;
                                    }
                                    if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                                        for (var i = 0; i < orgTree.length; i++) {
                                            for (var j = 0; j < buJson.masterjson.rows.row.length; j++) {
                                                var isFilterdRow = false;
                                                var orgname = '';
                                                for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                                    if (buJson.masterjson.rows.row[j].field[k].name == "orgname") {
                                                        if (orgTree[i].name == buJson.masterjson.rows.row[j].field[k].values.value) {
                                                            isFilterdRow = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isFilterdRow) {
                                                    for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                                        if (buJson.masterjson.rows.row[j].field[k].name == "environmentname") {
                                                            orgTree[i].environments.push(buJson.masterjson.rows.row[j].field[k].values.value);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    res.send(orgTree);
                                });

                            }

                        });



                    }

                });

                //getting business groups  

                //res.send(orgTree);

            } else {
                res.send(orgTree);
            }


        });

    });


    app.get('/organizations/:orgId/projects/:projectId/environments/:envId/blueprints', function(req, res) {
        blueprintsDao.getBlueprintsByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, req.query.blueprintType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.post('/organizations/:orgId/projects/:projectId/environments/:envId/blueprints', function(req, res) {
        var blueprintData = req.body.blueprintData;
        blueprintData.orgId = req.params.orgId;
        blueprintData.projectId = req.params.projectId;
        blueprintData.envId = req.params.envId;
        if (!blueprintData.runlist) {
            blueprintData.runlist = [];
        }
        if (!blueprintData.users || !blueprintData.users.length) {
            res.send(400);
            return;
        }

        blueprintsDao.createBlueprint(blueprintData, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.get('/organizations/:orgId/projects/:projectId/environments/:envId/instances', function(req, res) {
        instancesDao.getInstancesByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, req.query.instanceType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.get('/organizations/:orgId/projects/:projectId/environments/:envId/tasks', function(req, res) {
        tasksDao.getTasksByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.get('/organizations/:orgId/projects/:projectId/environments/:envId/', function(req, res) {
        tasksDao.getTasksByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, function(err, tasksData) {
            if (err) {
                res.send(500);
                return;
            }
            instancesDao.getInstancesByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, req.query.instanceType, req.session.user.cn, function(err, instancesData) {
                if (err) {
                    res.send(500);
                    return;
                }
                blueprintsDao.getBlueprintsByOrgProjectAndEnvId(req.params.orgId, req.params.projectId, req.params.envId, req.query.blueprintType, req.session.user.cn, function(err, blueprintsData) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    res.send({
                        tasks: tasksData,
                        instances: instancesData,
                        blueprints: blueprintsData
                    });
                });

            });

        });
    });

    app.post('/organizations/:orgId/projects/:projectId/environments/:envId/tasks', function(req, res) {
        var taskData = req.body.taskData;
        taskData.orgId = req.params.orgId;
        taskData.projectId = req.params.projectId;
        taskData.envId = req.params.envId;
        if (!taskData.runlist) {
            taskData.runlist = [];
        }

        tasksDao.createTask(taskData, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.get('/organizations/:orgname/cookbooks', function(req, res) {
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata", chefDetails);

            if (!chefDetails) {
                res.send(404);
                return;
            }

            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbooksList(function(err, cookbooks) {
                logger.error(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send({
                        serverId: chefDetails.rowid,
                        cookbooks: cookbooks
                    });
                }
            });

        });

    });

    app.get('/organizations/:orgname/roles', function(req, res) {
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata", chefDetails);
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getRolesList(function(err, roles) {
                logger.error(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send({
                        serverId: chefDetails.rowid,
                        roles: roles
                    });
                }
            });

        });

    });

    app.get('/organizations/:orgname/chefRunlist', function(req, res) {
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata", chefDetails);
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbooksList(function(err, cookbooks) {
                logger.error(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {
                        logger.error(err);
                        if (err) {
                            res.send(500);
                            return;
                        } else {
                            res.send({
                                serverId: chefDetails.rowid,
                                roles: roles,
                                cookbooks: cookbooks
                            });
                        }
                    });
                }
            });

        });

    });
    app.get('/organizations/usechefserver/:chefserverid/chefRunlist', function(req, res) {
        configmgmtDao.getChefServerDetails(req.params.chefserverid, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata", chefDetails);
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbooksList(function(err, cookbooks) {
                logger.error(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {
                        logger.error(err);
                        if (err) {
                            res.send(500);
                            return;
                        } else {
                            res.send({
                                serverId: chefDetails.rowid,
                                roles: roles,
                                cookbooks: cookbooks
                            });
                        }
                    });
                }
            });

        });

    });


    app.post('/organizations/:orgId/projects/:projectId/environments/:envId/addInstance', function(req, res) {

        if (!(req.body.fqdn && req.body.os)) {
            res.send(400);
        }

        if (req.body.credentials && req.body.credentials.username) {
            if (!(req.body.credentials.password || req.body.credentials.pemFileData)) {
                res.send(400);
            }
        } else {
            res.send(400);
        }

        function getCredentialsFromReq(callback) {
            var credentials = req.body.credentials;
            if (req.body.credentials.pemFileData) {
                credentials.pemFileLocation = appConfig.tempDir + uuid.v4();
                fileIo.writeFile(credentials.pemFileLocation, req.body.credentials.pemFileData, null, function(err) {
                    if (err) {
                        logger.error('unable to create pem file ', err);
                        callback(err, null);
                        return;
                    }
                    callback(null, credentials);
                });
            } else {
                callback(null, credentials);
            }
        }

        getCredentialsFromReq(function(err, credentials) {
            if (err) {
                res.send(500);
                return;
            }
            configmgmtDao.getChefServerDetailsByOrgname(req.params.orgId, function(err, chefDetails) {
                if (err) {
                    res.send(500);
                    return;
                }
                logger.debug("chefdata", chefDetails);
                if (!chefDetails) {
                    res.send(500);
                    return;
                }

                credentialCryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                    if (err) {
                        logger.error("unable to encrypt credentials", err);
                        res.send(500);
                        return;
                    }
                    var instance = {
                        orgId: req.params.orgId,
                        projectId: req.params.projectId,
                        envId: req.params.envId,
                        instanceIP: req.body.fqdn,
                        instanceState: 'unknown',
                        bootStrapStatus: 'waiting',
                        runlist: [],
                        users: [req.session.user.cn], //need to change this
                        hardware: {
                            platform: 'unknown',
                            platformVersion: 'unknown',
                            architecture: 'unknown',
                            memory: {
                                total: 'unknown',
                                free: 'unknown',
                            },
                            os: req.body.os
                        },
                        credentials: encryptedCredentials,
                        chef: {
                            serverId: chefDetails.rowid,
                            chefNodeName: req.body.fqdn
                        },
                        blueprintData: {
                            blueprintName: req.body.fqdn,
                            templateId: "chef_import",
                            iconPath: "../private/img/templateicons/chef_import.png"
                        }
                    }


                    instancesDao.createInstance(instance, function(err, data) {
                        if (err) {
                            logger.error(err);
                            res.send(500);
                            return;
                        }
                        instance.id = data._id;
                        instance._id = data._id;

                        logsDao.insertLog({
                            referenceId: instance.id,
                            err: false,
                            log: "Bootstrapping instance",
                            timestamp: new Date().getTime()
                        });

                        credentialCryptography.decryptCredential(encryptedCredentials, function(err, decryptedCredentials) {
                            if (err) {
                                logger.error("unable to decrypt credentials", err);
                                res.send(500);
                                return;
                            }
                            var chef = new Chef({
                                userChefRepoLocation: chefDetails.chefRepoLocation,
                                chefUserName: chefDetails.loginname,
                                chefUserPemFile: chefDetails.userpemfile,
                                chefValidationPemFile: chefDetails.validatorpemfile,
                                hostedChefUrl: chefDetails.url
                            });

                            chef.bootstrapInstance({
                                instanceIp: instance.instanceIP,
                                pemFilePath: decryptedCredentials.pemFileLocation,
                                instancePassword: decryptedCredentials.password,
                                instanceUsername: instance.credentials.username,
                                nodeName: instance.chef.chefNodeName,
                                environment: instance.envId,
                                instanceOS: instance.hardware.os
                            }, function(err, code) {
                                if (decryptedCredentials.pemFilePath) {
                                    fileIo.removeFile(decryptedCredentials.pemFilePath, function(err) {
                                        if (err) {
                                            logger.error("Unable to delete temp pem file =>", err);
                                        } else {
                                            logger.debug("temp pem file deleted");
                                        }
                                    });
                                }
                                if (err) {
                                    logger.error("knife launch err ==>", err);
                                    instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

                                    });

                                } else {
                                    if (code == 0) {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                            if (err) {
                                                logger.error("Unable to set instance bootstarp status. code 0");
                                            } else {
                                                logger.debug("Instance bootstrap status set to success");
                                            }
                                        });

                                        chef.getNode(instance.chef.chefNodeName, function(err, nodeData) {
                                            if (err) {
                                                console.log(err);
                                                return;
                                            }
                                            var hardwareData = {};
                                            hardwareData.architecture = nodeData.automatic.kernel.machine;
                                            hardwareData.platform = nodeData.automatic.platform;
                                            hardwareData.platformVersion = nodeData.automatic.platform_version;
                                            hardwareData.memory = {};
                                            if (nodeData.automatic.memory) {
                                                hardwareData.memory.total = nodeData.automatic.memory.total;
                                                hardwareData.memory.free = nodeData.automatic.memory.free;
                                            }
                                            hardwareData.os = instance.hardware.os;
                                            //console.log(instance);
                                            //console.log(hardwareData,'==',instance.hardware.os);
                                            instancesDao.setHardwareDetails(instance.id, hardwareData, function(err, updateData) {
                                                if (err) {
                                                    logger.error(err);
                                                    logger.error("Unable to set instance hardware details  code (setHardwareDetails)");
                                                } else {
                                                    logger.debug("Instance hardware details set successessfully");
                                                }
                                            });
                                            
                                        });

                                    } else {
                                        instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
                                            if (err) {
                                                logger.error("Unable to set instance bootstarp status code != 0");
                                            } else {
                                                logger.debug("Instance bootstrap status set to failed");
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
                                });

                            }, function(stdErrData) {

                                logsDao.insertLog({
                                    referenceId: instance.id,
                                    err: true,
                                    log: stdErrData.toString('ascii'),
                                    timestamp: new Date().getTime()
                                });
                            });
                            res.send(instance);
                        });
                    });
                });
            });
        });
    });

}