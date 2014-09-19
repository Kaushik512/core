var settingsController = require('../controller/settings');
var Chef = require('../classes/chef');
var EC2 = require('../classes/ec2');
var instancesDao = require('../classes/instances');
var environmentsDao = require('../classes/d4dmasters/environments.js');
var logsDao = require('../classes/dao/logsdao.js');
var masterjsonDao = require('../classes/d4dmasters/masterjson');

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/chef/*', verificationFunc);

    app.get('/chef/nodes', function(req, res) {
        settingsController.getChefSettings(function(settings) {
            var chef = new Chef(settings);
            chef.getNodesDetailsForEachEnvironment(function(err, environmentList) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(environmentList);
                }
            });
        });
    });


    app.post('/chef/sync/nodes', function(req, res) {
        var reqBody = req.body;
        var projectId = reqBody.projectId;
        var orgId = reqBody.orgId;
        var count = 0;

        var insertNodeInMongo = function(node) {
            var platformId = '';
            var nodeIp = node.ip;
            var nodeData = node.nodeData;
            if (!node.nodeData.automatic) {
                node.nodeData.automatic = {};
            }
            if (node.nodeData.automatic.ec2) {
                platformId = node.nodeData.automatic.ec2.instance_id;
                if (node.nodeData.automatic.ec2.public_ipv4) {
                    nodeIp = node.nodeData.automatic.ec2.public_ipv4;
                }
            }
            if (node.nodeData.automatic.ec2) {
                platformId = node.nodeData.automatic.ec2.instance_id;
            }

            var hardwareData = {
                platform: 'unknown',
                platformVersion: 'unknown',
                architecture: 'unknown',
                memory: {
                    total: 'unknown',
                    free: 'unknown',
                }
            };
            if (nodeData.automatic.kernel && nodeData.automatic.kernel.machine) {
                hardwareData.architecture = nodeData.automatic.kernel.machine;
            }
            if (nodeData.automatic.platform) {
                hardwareData.platform = nodeData.automatic.platform;
            }
            if (nodeData.automatic.platform_version) {
                hardwareData.platformVersion = nodeData.automatic.platform_version;
            }
            if (nodeData.automatic.memory) {
                hardwareData.memory.total = nodeData.automatic.memory.total;
                hardwareData.memory.free = nodeData.automatic.memory.free;
            }


            console.log("runlist ==>", node.runlist);
            var instance = {
                projectId: projectId,
                envId: node.env,
                chefNodeName: node.nodeName,
                runlist: node.runlist,
                platformId: platformId,
                instanceIP: nodeIp,
                instanceState: 'unknown',
                bootStrapStatus: 'success',
                hardware: hardwareData,
                blueprintData: {
                    blueprintName: "chef import",
                    templateId: "chef_import"
                }

            }
            instancesDao.createInstance(instance, function(err, data) {
                if (err) {
                    console.log(err, 'occured in inserting node in mongo');
                    return;
                }
                logsDao.insertLog({
                    referenceId: data._id,
                    err: false,
                    log: "Node Imported",
                    timestamp: new Date().getTime()
                });
                settingsController.getAwsSettings(function(settings) {
                    var ec2 = new EC2(settings);
                    if (platformId) {
                        ec2.getInstanceState(platformId, function(err, state) {
                            var instanceState;
                            if (err) {
                                instanceState = 'unknown';
                            } else {
                                instanceState = state
                            }
                            instancesDao.updateInstanceState(data._id, instanceState, function(err, data) {
                                if (err) {
                                    console.log(err, 'occured in inserting node in mongo');
                                    return;
                                }
                                console.log('instance state updated');
                                logsDao.insertLog({
                                    referenceId: data._id,
                                    err: false,
                                    log: "Instance State set to " + instanceState,
                                    timestamp: new Date().getTime()
                                });
                            });



                        });
                    }

                });



            });



        }

        function createEnv(node) {
            console.log('creating env ==>', node.env);
            console.log('orgId ==>', orgId);
            environmentsDao.createEnv(node.env, orgId, function(err, data) {
                count++;
                if (err) {
                    console.log(err, 'occured in creating environment in mongo');
                    return;
                }

                insertNodeInMongo(node);
                if (count === reqBody.selectedNodes.length) {
                    res.send(200);
                } else {
                    createEnv(reqBody.selectedNodes[count]);
                }
            })
        }

        if (reqBody.selectedNodes.length) {
            createEnv(reqBody.selectedNodes[count]);
        }



    });

    app.post('/chef/environments/create', function(req, res) {

        settingsController.getChefSettings(function(settings) {
            var chef = new Chef(settings);
            chef.createEnvironment(req.body.envName, function(err, envName) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(envName);
                }
            });
        });
    });

    app.get('/chef/cookbooks', function(req, res) {
        settingsController.getChefSettings(function(settings) {
            var chef = new Chef(settings);
            chef.getCookbooksList(function(err, cookbooks) {
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send(cookbooks);
                }
            });
        });
    });

    app.get('/chef/servers/:serverId', function(req, res) {
        console.log(req.params.serverId);
        masterjsonDao.getMasterJson("10", function(err, chefJson) {
            if (err) {
                res.send(500);
                return;
            }
            if (chefJson.masterjson && chefJson.masterjson.rows && chefJson.masterjson.rows.row) {
                
                for (var i = 0; i < chefJson.masterjson.rows.row.length; i++) {
                    for (var j = 0; j < chefJson.masterjson.rows.row[i].field.length; j++) {
                        //console.log(orgsJson.masterjson.rows.row[i].field[j]);
                        if (chefJson.masterjson.rows.row[i].field[j].name = "orgname") {
                           
                            break;
                        }
                    }
                }
            }

        });

    });



};