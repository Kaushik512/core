var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/blueprints');

var instancesDao = require('../model/instances');
var tasksDao = require('../model/tasks');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');

module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/organizations/*', sessionVerification);


    app.get('/organizations/getTreeNew',function(req,res){
       
               
                d4dModelNew.d4dModelMastersOrg.find({
                id: '1'
                }, function(err, d4dMasterJsonOrg) {
                    if (err) {
                        console.log("Hit and error:" + err);
                        res.send('500');
                        return;
                    }
                    //res.end(JSON.stringify(d4dMasterJson));
                    var orgJson = JSON.parse(JSON.stringify(d4dMasterJsonOrg));
                    var orgkeys = Object.keys(orgJson);
                    var orgTree = [];

                    console.log("Filling Orgs :" + JSON.stringify(orgJson));
                    for (i = 0; i < orgkeys.length; i++) { //Org Loop
                        var k = orgkeys[i]; //index of the org
                        var orgname = orgJson[i]['orgname'];
                        var orgObj = "name:" + orgname;
                        orgTree.push(orgObj);
                        console.log('orgname:' + orgname);
                        //Business Group Loop
                        d4dModelNew.d4dModelMastersProductGroup.find({
                                    id: '2',
                                    'orgname': orgname
                            }, function(err, d4dMasterJsonBG) {
                                if (err) {
                                    console.log("Hit and error in d4dMasterJsonOrg:" + err);
                                    res.send('500');
                                    return;
                                }
                                else{
                                    var bgJson = JSON.parse(JSON.stringify(d4dMasterJsonBG));
                                    var bgkeys = Object.keys(bgJson);
                                    

                                   // console.log("Filling BGs :" + JSON.stringify(bgJson));
                                    for (_i = 0; _i < bgkeys.length; _i++) { //Bg Loop
                                        var k = bgkeys[_i]; //index of the org
                                        var bgname = bgJson[_i]['productgroupname'];
                                        console.log('BGname:' + bgname + ' orgname:' + orgname);
                                        var bgObj = "name:" + bgname;
                                        orgObj += ",businessGroups:[{" + bgObj;

                                        //Project Loop
                                        d4dModelNew.d4dModelMastersProjects.find({
                                            id: '4',
                                            'orgname': orgname,
                                            'productgroupname': bgname,
                                        }, function(err, d4dMasterJsonProjects) {
                                            if (err) {
                                                console.log("Hit and error in d4dModelMastersProjects:" + err);
                                                res.send('500');
                                                return;
                                            }
                                            else{
                                                console.log('In projects:' + 'BGname:' + bgname + ' orgname:' + orgname);
                                                var projJson = JSON.parse(JSON.stringify(d4dMasterJsonProjects));
                                               // console.log("Filling Projs :" + JSON.stringify(projJson));
                                                var projkeys = Object.keys(projJson);
                                               var projObj = [];
                                             //   console.log("Filling Projs :" + JSON.stringify(projJson));
                                                for (__i = 0; __i < projkeys.length; __i++) { //Bg Loop
                                                    var k = projkeys[__i]; //index of the org
                                                    var projname = projJson[__i]['projectname'];
                                                    console.log('Projname:' + projname); 
                                                    projObj.push(projname);

                                                } //end of proj loop
                                                bgObj += ",projects:["+ projObj.join(',') + ']}]';
                                                
                                                if(_i >= bgkeys.length){
                                                    orgObj += '}'
                                                    orgTree.push(orgObj);
                                                }
                                                //Check if all the loops has been executed.
                                                if(i >= orgkeys.length && _i >= bgkeys.length && __i >= projkeys.length){
                                                    
                                                    res.end(JSON.stringify(orgTree));
                                                    return;
                                                }


                                            }
                                        });

                                    } //end of bg loop

                                   
                                    console.log(JSON.stringify(orgTree));
                                }
                        });

                    } //end of org loop
                    
                    //res.send('200');
                });
            
    });

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
                        //console.log(orgsJson.masterjson.rows.row[i].field[j]);
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
                                console.log(isFilterdRow);
                                if (isFilterdRow) {
                                    for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                        console.log(buJson.masterjson.rows.row[j].field[k].name);
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
                                                        console.log(buJson.masterjson.rows.row[k].field[l].name);
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
                                                        console.log(buJson.masterjson.rows.row[j].field[k].name);
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
            console.log("BluePrint >>>>>>" + JSON.stringify(data));
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
        console.log(blueprintData);

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
                        tasks:tasksData,
                        instances:instancesData,
                        blueprints:blueprintsData
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
            console.log("chefdata", chefDetails);

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
                console.log(err);
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
            console.log("chefdata", chefDetails);
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
                console.log(err);
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
            console.log("chefdata", chefDetails);
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
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {
                        console.log(err);
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
    console.log('hit received');
        configmgmtDao.getChefServerDetails(req.params.chefserverid, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            console.log("chefdata", chefDetails);
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
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {
                        console.log(err);
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


}