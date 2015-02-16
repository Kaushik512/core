var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/dao/instancesdao');
var tasksDao = require('../model/tasks');
var appConfig = require('../config/app_config');
var logger = require('../lib/logger')(module);
var uuid = require('node-uuid');
var fileIo = require('../lib/utils/fileio');
var logsDao = require('../model/dao/logsdao.js');

var errorResponses = require('./error_responses');


var credentialCryptography = require('../lib/credentialcryptography');

var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var Curl = require('../lib/utils/curl.js');
var waitForPort = require('wait-for-port');



module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/organizations/*', sessionVerification);

    app.get('/organizations/getTreeNew', function(req, res) {
        d4dModelNew.d4dModelMastersOrg.find({
            id: 1
        }, function(err, docorgs) {
            var orgnames = docorgs.map(function(docorgs1) {
                return docorgs1.orgname;
            });

            var orgTree = [];
            var orgCount = 0;
            orgnames.forEach(function(k, v) {
                //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
                orgTree.push({
                    name: k,
                    businessGroups: [],
                    environments: []
                });
            });
            orgCount++;
            d4dModelNew.d4dModelMastersProductGroup.find({
                id: 2,
                orgname: {
                    $in: orgnames
                }
            }, function(err, docbgs) {
                if (docbgs.length <= 0) {
                    res.send(orgTree);
                    return;
                }
                var counter = 0;
                for (var k = 0; k < docbgs.length; k++) {
                    for (var i = 0; i < orgTree.length; i++) {
                        if (orgTree[i]['name'] == docbgs[k]['orgname']) {
                            //  console.log('found' );
                            orgTree[i]['businessGroups'].push({
                                name: docbgs[k]['productgroupname'],
                                projects: []
                            });
                            d4dModelNew.d4dModelMastersProjects.find({
                                id: 4,
                                orgname: orgTree[i]['name'],
                                productgroupname: docbgs[k]['productgroupname']
                            }, function(err, docprojs) {
                                // console.log('Projects:' + docprojs);

                                var prjnames = docprojs.map(function(docprojs1) {
                                    return docprojs1.projectname;
                                });

                                for (var _i = 0; _i < orgTree.length; _i++) {
                                    console.log('Orgnames:' + orgTree[_i]['name']);
                                    for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                        console.log('businessGroups:' + orgTree[_i]['businessGroups'][__i]['name']);
                                        console.log('docprojs.length:' + docprojs.length);
                                        for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                            if (docprojs[_bg]['orgname'] == orgTree[_i]['name'] && docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']) {
                                                console.log('hit');
                                                if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                    for (var _prj = 0; _prj < docprojs.length; _prj++) {
                                                        var envs = docprojs[_prj]['environmentname'].split(',');
                                                        console.log("Env in:" + docprojs);
                                                        orgTree[_i]['businessGroups'][__i]['projects'].push({ //
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
                                if (counter >= docbgs.length - 1) {
                                    d4dModelNew.d4dModelMastersEnvironments.find({
                                        id: 3,
                                        orgname: {
                                            $in: orgnames
                                        }
                                    }, function(err, docenvs) {
                                        for (var _i = 0; _i < orgTree.length; _i++) {
                                            for (var _env = 0; _env < docenvs.length; _env++) {
                                                if (orgTree[_i]['name'] == docenvs[_env]['orgname']) {
                                                    orgTree[_i]['environments'].push(docenvs[_env]['environmentname']);
                                                }
                                            }
                                            if (_i >= orgTree.length - 1) {
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

    app.get('/organizations/getTreeForbtv', function(req, res) {
        console.log("Enter /organizations/getTreeForbtv");
        d4dModelNew.d4dModelMastersOrg.find({
            id: 1
        }, function(err, docorgs) {
            var orgnames = docorgs.map(function(docorgs1) {
                return docorgs1.orgname;
            });

            var orgTree = [];
            var orgCount = 0;
            orgnames.forEach(function(k, v) {
                //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
                orgTree.push({
                    name: k,
                    text: k,
                    href: 'javascript:void(0)',
                    icon: 'fa fa-building ',
                    nodes: [],
                    borderColor: '#000',
                    businessGroups: [],
                    selectable: false,
                    itemtype: 'org',
                    environments: []
                });
            });
            orgCount++;
            console.log("Found Orgs");
            d4dModelNew.d4dModelMastersProductGroup.find({
                id: 2,
                orgname: {
                    $in: orgnames
                }
            }, function(err, docbgs) {
                if (docbgs.length <= 0) { //no bgs for any org return tree
                    console.log('Not found any BUs returing empty orgs');
                    res.send(orgTree);
                    return;
                }
                var counter = 0;
                for (var k = 0; k < docbgs.length; k++) {
                    for (var i = 0; i < orgTree.length; i++) {
                        if (orgTree[i]['name'] == docbgs[k]['orgname']) {
                            //  console.log('found' );
                            orgTree[i]['businessGroups'].push({
                                name: docbgs[k]['productgroupname'],
                                text: docbgs[k]['productgroupname'],
                                href: 'javascript:void(0)',
                                nodes: [],
                                projects: []
                            });
                            orgTree[i]['nodes'].push({
                                name: docbgs[k]['productgroupname'],
                                text: docbgs[k]['productgroupname'].substring(0, 21),
                                orgname: orgTree[i]['name'],
                                icon: 'fa fa-fw fa-1x fa-group',
                                borderColor: '#000',
                                href: 'javascript:void(0)',
                                nodes: [],
                                selectable: false,
                                itemtype: 'bg',
                                projects: []
                            });
                            d4dModelNew.d4dModelMastersProjects.find({
                                id: 4,
                                orgname: orgTree[i]['name'],
                                productgroupname: docbgs[k]['productgroupname']
                            }, function(err, docprojs) {
                                // console.log('Projects:' + docprojs);

                                var prjnames = docprojs.map(function(docprojs1) {
                                    return docprojs1.projectname;
                                });

                                for (var _i = 0; _i < orgTree.length; _i++) {
                                    console.log('Orgnames:' + orgTree[_i]['name']);
                                    for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                        console.log('businessGroups:' + orgTree[_i]['businessGroups'][__i]['name']);
                                        console.log('docprojs.length:' + docprojs.length);
                                        for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                            if (docprojs[_bg]['orgname'] == orgTree[_i]['name'] && docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']) {
                                                console.log('hit');
                                                if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                    for (var _prj = 0; _prj < docprojs.length; _prj++) {
                                                        var envs = docprojs[_prj]['environmentname'].split(',');
                                                        var envs_ = [];
                                                        for (var nt = 0; nt < envs.length; nt++) {
                                                            //fixing the length of the env name
                                                            var ttp = '';
                                                            if (envs[nt].length > 12) {
                                                                ttp = envs[nt];
                                                                envs[nt] = envs[nt]; //.substring(0, 12);
                                                            }
                                                            if (envs[nt] != '') {
                                                                envs_.push({
                                                                    text: envs[nt],
                                                                    href: '#ajax/Dev.html?org=' + orgTree[_i]['name'] + '&bg=' + orgTree[_i]['businessGroups'][__i]['name'] + '&projid=' + docprojs[_prj]['projectname'] + '&envid=' + envs[nt],
                                                                    orgname: orgTree[_i]['name'],
                                                                    projname: docprojs[_prj]['projectname'],
                                                                    bgname: orgTree[_i]['businessGroups'][__i]['name'],
                                                                    itemtype: 'env',
                                                                    tooltip: ttp,
                                                                    icon: 'fa fa-fw fa-1x fa-desktop'
                                                                });
                                                            }
                                                        }
                                                        console.log("Env in:" + docprojs);
                                                        orgTree[_i]['businessGroups'][__i]['projects'].push({ //
                                                            name: docprojs[_prj]['projectname'],
                                                            environments: envs
                                                        });
                                                        orgTree[_i]['nodes'][__i]['nodes'].push({ //
                                                            name: docprojs[_prj]['projectname'],
                                                            text: docprojs[_prj]['projectname'],
                                                            orgname: orgTree[_i]['name'],
                                                            bgname: orgTree[_i]['businessGroups'][__i]['name'],
                                                            icon: 'fa fa-fw fa-1x fa-tasks',
                                                            nodes: envs_,
                                                            borderColor: '#000',
                                                            selectable: false,
                                                            itemtype: 'proj',
                                                            href: 'javascript:void(0)',
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
                                if (counter >= docbgs.length - 1) {
                                    d4dModelNew.d4dModelMastersEnvironments.find({
                                        id: 3,
                                        orgname: {
                                            $in: orgnames
                                        }
                                    }, function(err, docenvs) {
                                        for (var _i = 0; _i < orgTree.length; _i++) {
                                            for (var _env = 0; _env < docenvs.length; _env++) {
                                                if (orgTree[_i]['name'] == docenvs[_env]['orgname']) {
                                                    orgTree[_i]['environments'].push(docenvs[_env]['environmentname']);
                                                }
                                            }
                                            if (_i >= orgTree.length - 1) {
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

    app.get('/organizations/getTree', function(req, res) {
        d4dModelNew.d4dModelMastersOrg.find({
            id: 1
        }, function(err, docorgs) {
            var orgnames = docorgs.map(function(docorgs1) {
                return docorgs1.orgname;
            });

            var orgTree = [];
            var orgCount = 0;
            orgnames.forEach(function(k, v) {
                //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
                orgTree.push({
                    name: k,
                    businessGroups: [],
                    environments: []
                });
            });
            orgCount++;
            d4dModelNew.d4dModelMastersProductGroup.find({
                id: 2,
                orgname: {
                    $in: orgnames
                }
            }, function(err, docbgs) {
                var counter = 0;
                for (var k = 0; k < docbgs.length; k++) {
                    for (var i = 0; i < orgTree.length; i++) {
                        if (orgTree[i]['name'] == docbgs[k]['orgname']) {
                            //  console.log('found' );
                            orgTree[i]['businessGroups'].push({
                                name: docbgs[k]['productgroupname'],
                                projects: []
                            });
                            d4dModelNew.d4dModelMastersProjects.find({
                                id: 4,
                                orgname: orgTree[i]['name'],
                                productgroupname: docbgs[k]['productgroupname']
                            }, function(err, docprojs) {
                                // console.log('Projects:' + docprojs);

                                var prjnames = docprojs.map(function(docprojs1) {
                                    return docprojs1.projectname;
                                });

                                for (var _i = 0; _i < orgTree.length; _i++) {
                                    console.log('Orgnames:' + orgTree[_i]['name']);
                                    for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                        console.log('businessGroups:' + orgTree[_i]['businessGroups'][__i]['name']);
                                        console.log('docprojs.length:' + docprojs.length);
                                        for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                            if (docprojs[_bg]['orgname'] == orgTree[_i]['name'] && docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']) {
                                                console.log('hit');
                                                if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                    for (var prjname in prjnames)
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
                                if (counter >= docbgs.length - 1) {
                                    d4dModelNew.d4dModelMastersEnvironments.find({
                                        id: 3,
                                        orgname: {
                                            $in: orgnames
                                        }
                                    }, function(err, docenvs) {
                                        for (var _i = 0; _i < orgTree.length; _i++) {
                                            for (var _env = 0; _env < docenvs.length; _env++) {
                                                if (orgTree[_i]['name'] == docenvs[_env]['orgname']) {
                                                    orgTree[_i]['environments'].push(docenvs[_env]['environmentname']);
                                                }
                                            }
                                            if (_i >= orgTree.length - 1) {
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

                if (err) {
                    logger.error('Unable to fetch cookbooks : ', err);
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

                if (err) {
                    logger.error('Unable to fetch roles : ', err);
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
                res.send(500, errorResponses.db.error);
                return;
            }
            logger.debug("chefdata", chefDetails);
            if (!chefDetails) {
                res.send(404, errorResponses.db.error);
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

                if (err) {
                    logger.error('Unable to fetch cookbooks : ', err);
                    res.send(500, errorResponses.chef.connectionError);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {

                        if (err) {
                            logger.error('Unable to fetch roles : ', err);
                            res.send(500, errorResponses.chef.connectionError);
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
                if (err) {
                    logger.error('Unable to fetch cookbooks : ', err);
                    res.send(500);
                    return;
                } else {
                    chef.getRolesList(function(err, roles) {

                        if (err) {
                            logger.error('Unable to fetch roles : ', err);
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
        instancesDao.getInstancesByOrgEnvIdAndChefNodeName(req.params.orgId, req.params.envId, req.body.fqdn, function(err, instances) {
            if (err) {
                logger.error("error occured while fetching instances by IP", err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (instances.length) {
                res.send(400, errorResponses.instance.exist);
                return;
            }

            console.log('Received Users:' + req.body.users);
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
                    //Verifying if the node is alive
                    var nodeAlive = 'running';
                    waitForPort(req.body.fqdn, 22, function(err) {
                        if(err) {
                          console.log(err);
                          res.send(400,{message:"Instance is not running"});
                          return;  
                        }
                        //    console.log('node ===>', node);
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
                                instanceState: nodeAlive,
                                bootStrapStatus: 'waiting',
                                runlist: [],
                                users: req.body.users, //[req.session.user.cn], //need to change this
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
                                    logger.error('Unable to create Instance ', err);
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

                                    //removing files on node to facilitate re-bootstrap
                                    var opts = {
                                            privateKey: decryptedCredentials.pemFileLocation,
                                            username: decryptedCredentials.username,
                                            host: instance.instanceIP,
                                            instanceOS: instance.hardware.os,
                                            port: 22,
                                            cmds: ["rm -rf /etc/chef/", "rm -rf /var/chef/"],
                                            cmdswin: ["del "]
                                        }
                                        //cmds: ["rm -rf /etc/chef/","rm -rf /var/chef/"] ["ls -l","ls -al"]
                                    console.log('decryptCredentials ==>', decryptedCredentials);
                                    if (decryptedCredentials.pemFileLocation) {
                                        opts.privateKey = decryptedCredentials.pemFileLocation;
                                    } else {
                                        opts.password = decryptedCredentials.password;
                                    }
                                    console.log("Node OS : " + instance.hardware.os);
                                    chef.cleanChefonClient(opts, function(err, retCode) {
                                        console.log('Entering chef.bootstarp');
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
                                                                logger.error("Unable to set instance hardware details  code (setHardwareDetails)", err);
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

                                    }); //end of chefcleanup

                                });
                                res.send(instance);
                            });
                        });

                    });
                });
            });
        });
    });

}