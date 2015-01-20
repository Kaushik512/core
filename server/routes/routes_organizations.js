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
       d4dModelNew.d4dModelMastersOrg.find({id:1},function(err,docorgs){
        var orgnames = docorgs.map(function(docorgs1){return docorgs1.orgname;});

        var orgTree = [];
        var orgCount = 0;
        orgnames.forEach(function(k,v){
            //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
            orgTree.push({
                                name: k,
                                businessGroups: [],
                                environments: []
                            });
        });
        orgCount++;
            d4dModelNew.d4dModelMastersProductGroup.find({id:2,orgname: {$in:orgnames}},function(err,docbgs){
                var counter = 0;
                for(var k = 0; k < docbgs.length; k++){
                    for (var i = 0; i < orgTree.length; i++) {
                            if(orgTree[i]['name'] == docbgs[k]['orgname'] ){
                              //  console.log('found' );
                                orgTree[i]['businessGroups'].push({
                                    name: docbgs[k]['productgroupname'],
                                    projects: []
                                });
                                d4dModelNew.d4dModelMastersProjects.find({id:4,orgname:orgTree[i]['name'],productgroupname:docbgs[k]['productgroupname']},function(err,docprojs){
                                   // console.log('Projects:' + docprojs);

                                    var prjnames = docprojs.map(function(docprojs1){return docprojs1.projectname;});
                                   
                                    for (var _i = 0; _i < orgTree.length; _i++) {
                                        console.log('Orgnames:' + orgTree[_i]['name']);
                                        for(var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++){
                                            console.log('businessGroups:' + orgTree[_i]['businessGroups'][__i]['name']); 
                                            console.log('docprojs.length:' + docprojs.length);
                                            for(var _bg =0; _bg < docprojs.length;_bg++){
                                                
                                                if(docprojs[_bg]['orgname'] == orgTree[_i]['name'] &&  docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']){
                                                    console.log('hit');
                                                    if(orgTree[_i]['businessGroups'][__i]['projects'].length <= 0){
                                                        for(var _prj = 0; _prj < docprojs.length;_prj++){
                                                            var envs = docprojs[_prj]['environmentname'].split(',');
                                                            console.log("Env in:" + docprojs);
                                                            orgTree[_i]['businessGroups'][__i]['projects'].push( {//
                                                                     name: docprojs[_prj]['projectname'],
                                                                     environments: envs
                                                                });
                                                        }
                                                            
                                                    }

                                                 //   console.log("Env:" + docprojs[_bg]['environmentname']);
                                                    // if(orgTree[_i]['environments'].length <=0){
                                                    //     for(var envname in docprojs[_bg]['environmentname'])
                                                    //          orgTree[_i]['environments'].push(docprojs[_bg]['environmentname'][envname]);
                                                    // }
                                                }
                                            }
                                        }
                                    }
                                     console.log("OrgTree:" + JSON.stringify(orgTree));
                                     if(counter >= docbgs.length - 1){
                                        d4dModelNew.d4dModelMastersEnvironments.find({id:3,orgname: {$in:orgnames}},function(err,docenvs){
                                            for (var _i = 0; _i < orgTree.length; _i++) {
                                                for(var _env =0; _env < docenvs.length;_env++){
                                                    if(orgTree[_i]['name'] == docenvs[_env]['orgname'] ){
                                                        orgTree[_i]['environments'].push(docenvs[_env]['environmentname']);
                                                    }
                                                }
                                                if(_i >= orgTree.length -1){
                                                    res.send(orgTree);
                                                    return;
                                                }
                                            }
                                        });

                                        //res.send(orgTree);
                                       // return;
                                        
                                     }
                                     counter++;
                                });
                                
                            }

                    }
                    
                }
                //finding the current bg
                // orgTree.forEach(function(k1,v1){
                    
                //     // orgTree[v1].forEach(function(k2,v2){
                //     //         console.log(orgTree[v1][v2]);
                //     // });

                // });
                //     var orgj = JSON.parse(k1);
                //     Object.keys(orgj).forEach(function(vals,keys){
                //        console.log('key' + keys + ' ' + vals);

                //    });
                //    // console.log("orgTree:" + JSON.stringify(orgTree));
                // });

               // orgTree.businessGroups.push(docbgs.)
            });
        

       });
              
            
    });


    app.get('/organizations/getTree',function(req,res){
       d4dModelNew.d4dModelMastersOrg.find({id:1},function(err,docorgs){
        var orgnames = docorgs.map(function(docorgs1){return docorgs1.orgname;});

        var orgTree = [];
        var orgCount = 0;
        orgnames.forEach(function(k,v){
            //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
            orgTree.push({
                                name: k,
                                businessGroups: [],
                                environments: []
                            });
        });
        orgCount++;
            d4dModelNew.d4dModelMastersProductGroup.find({id:2,orgname: {$in:orgnames}},function(err,docbgs){
                var counter = 0;
                for(var k = 0; k < docbgs.length; k++){
                    for (var i = 0; i < orgTree.length; i++) {
                            if(orgTree[i]['name'] == docbgs[k]['orgname'] ){
                              //  console.log('found' );
                                orgTree[i]['businessGroups'].push({
                                    name: docbgs[k]['productgroupname'],
                                    projects: []
                                });
                                d4dModelNew.d4dModelMastersProjects.find({id:4,orgname:orgTree[i]['name'],productgroupname:docbgs[k]['productgroupname']},function(err,docprojs){
                                   // console.log('Projects:' + docprojs);

                                    var prjnames = docprojs.map(function(docprojs1){return docprojs1.projectname;});
                                   
                                    for (var _i = 0; _i < orgTree.length; _i++) {
                                        console.log('Orgnames:' + orgTree[_i]['name']);
                                        for(var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++){
                                            console.log('businessGroups:' + orgTree[_i]['businessGroups'][__i]['name']); 
                                            console.log('docprojs.length:' + docprojs.length);
                                            for(var _bg =0; _bg < docprojs.length;_bg++){
                                                
                                                if(docprojs[_bg]['orgname'] == orgTree[_i]['name'] &&  docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']){
                                                    console.log('hit');
                                                    if(orgTree[_i]['businessGroups'][__i]['projects'].length <= 0){
                                                        for(var prjname in prjnames)
                                                            orgTree[_i]['businessGroups'][__i]['projects'].push(prjnames[prjname]);
                                                    }

                                                    console.log("Env:" + docprojs[_bg]['environmentname']);
                                                    // if(orgTree[_i]['environments'].length <=0){
                                                    //     for(var envname in docprojs[_bg]['environmentname'])
                                                    //          orgTree[_i]['environments'].push(docprojs[_bg]['environmentname'][envname]);
                                                    // }
                                                }
                                            }
                                        }
                                    }
                                     console.log("OrgTree:" + JSON.stringify(orgTree));
                                     if(counter >= docbgs.length - 1){
                                        d4dModelNew.d4dModelMastersEnvironments.find({id:3,orgname: {$in:orgnames}},function(err,docenvs){
                                            for (var _i = 0; _i < orgTree.length; _i++) {
                                                for(var _env =0; _env < docenvs.length;_env++){
                                                    if(orgTree[_i]['name'] == docenvs[_env]['orgname'] ){
                                                        orgTree[_i]['environments'].push(docenvs[_env]['environmentname']);
                                                    }
                                                }
                                                if(_i >= orgTree.length -1){
                                                    res.send(orgTree);
                                                    return;
                                                }
                                            }
                                        });

                                        //res.send(orgTree);
                                       // return;
                                        
                                     }
                                     counter++;
                                });
                                
                            }

                    }
                    
                }
                //finding the current bg
                // orgTree.forEach(function(k1,v1){
                    
                //     // orgTree[v1].forEach(function(k2,v2){
                //     //         console.log(orgTree[v1][v2]);
                //     // });

                // });
                //     var orgj = JSON.parse(k1);
                //     Object.keys(orgj).forEach(function(vals,keys){
                //        console.log('key' + keys + ' ' + vals);

                //    });
                //    // console.log("orgTree:" + JSON.stringify(orgTree));
                // });

               // orgTree.businessGroups.push(docbgs.)
            });
        

       });
              
            
    });

    app.get('/organizations/getTreeOld', function(req, res) {
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
            console.log("chefdata for cookbooks", chefDetails.chefRepoLocation);

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
            console.log("chefdata for roles", chefDetails);
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
            console.log("chefdata for runlist", chefDetails);
            chefDetails = JSON.parse(chefDetails);
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
            console.log("chefdata userchefserver", chefDetails);
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