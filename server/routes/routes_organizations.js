var masterjsonDao = require('../model/d4dmasters/masterjson.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var blueprintsDao = require('../model/dao/blueprints');
var usersDao = require('../model/users.js');
var instancesDao = require('../model/classes/instance/instance');
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

var appCardsDao = require('../model/dao/appcarddao');

var Application = require('../model/classes/application/application');

var Task = require('../model/classes/tasks/tasks.js');
var masterUtil = require('../lib/utils/masterUtil.js');

module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/organizations/*', sessionVerification);

    app.get('/organizations/getTreeNew', function(req, res) {
        logger.debug("Enter get() for /organizations/getTreeNew");
        configmgmtDao.getTeamsOrgBuProjForUser(req.session.user.cn, function(err, objperms) {
            var orgTree = [];
            if (err) {
                logger.debug("Hit an error in getTeamsOrgBuProjForUser : " + err);
                res.send(orgTree);
                return;
            } else {
                logger.debug('Objperms:' + JSON.stringify(objperms));
                configmgmtDao.getRowids(function(err, rowidlist) {
                    logger.debug("Rowid List /organizations/getTreeNew -->%s", rowidlist);
                    d4dModelNew.d4dModelMastersOrg.find({
                        id: 1,
                        active: true,
                        rowid: {
                            $in: objperms.orgs
                        }
                    }, function(err, docorgs) {
                        var orgids = docorgs.map(function(docorgs1) {
                            return docorgs1.rowid;
                        });

                        var orgCount = 0;
                        orgids.forEach(function(k, v) {
                            //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
                            //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                            logger.debug("Org v:%s", JSON.stringify(v));
                            orgname = configmgmtDao.convertRowIDToValue(k, rowidlist);
                            orgTree.push({
                                name: orgname,
                                orgid: k,
                                rowid: k,
                                businessGroups: [],
                                environments: []
                            });
                        });
                        orgCount++;
                        d4dModelNew.d4dModelMastersProductGroup.find({
                            id: 2,
                            orgname_rowid: {
                                $in: orgids
                            },
                            rowid: {
                                $in: objperms.bunits
                            }
                        }, function(err, docbgs) {
                            if (docbgs.length <= 0) {
                                res.send(orgTree);
                                return;
                            }
                            var counter = 0;
                            for (var k = 0; k < docbgs.length; k++) {
                                for (var i = 0; i < orgTree.length; i++) {
                                    if (orgTree[i]['orgid'] == docbgs[k]['orgname_rowid']) {
                                        //  console.log('found' );
                                        bgname = configmgmtDao.convertRowIDToValue(docbgs[k]['rowid'], rowidlist);
                                        orgTree[i]['businessGroups'].push({
                                            name: bgname,
                                            rowid: docbgs[k]['rowid'],
                                            projects: []
                                        });
                                        d4dModelNew.d4dModelMastersProjects.find({
                                            id: 4,
                                            orgname_rowid: orgTree[i]['rowid'],
                                            productgroupname_rowid: docbgs[k]['rowid']
                                            //,rowid: {$in: objperms.projects}
                                        }, function(err, docprojs) {
                                            logger.debug("Projects:%s", JSON.stringify(docprojs));

                                            var prjids = docprojs.map(function(docprojs1) {
                                                return docprojs1.rowid;
                                            });

                                            for (var _i = 0; _i < orgTree.length; _i++) {
                                                logger.debug("Orgid:%s", orgTree[_i]['rowid']);
                                                for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                                    logger.debug("businessGroups rowid:%s%s", orgTree[_i]['businessGroups'], [__i]['rowid']);
                                                    logger.debug("docprojs.length:%s", docprojs.length);
                                                    for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                                        if (docprojs[_bg]['orgname_rowid'] == orgTree[_i]['rowid'] && docprojs[_bg]['productgroupname_rowid'] == orgTree[_i]['businessGroups'][__i]['rowid']) {
                                                            logger.debug("hit");
                                                            if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                                for (var _prj = 0; _prj < docprojs.length; _prj++) {
                                                                    var envsids = docprojs[_prj]['environmentname_rowid'].split(',');
                                                                    var envs = '';
                                                                    for (var _envid in envsids) {
                                                                        var tempenvname = configmgmtDao.convertRowIDToValue(_envid, rowidlist);
                                                                        if (envs == '') {
                                                                            envs += tempenvname;
                                                                        } else {
                                                                            envs += ',' + tempenvname;
                                                                        }
                                                                    }
                                                                    // logger.debug("Env in:%s", docprojs);
                                                                    prjname = configmgmtDao.convertRowIDToValue(docprojs[_prj]['rowid'], rowidlist);
                                                                    orgTree[_i]['businessGroups'][__i]['projects'].push({ //
                                                                        name: prjname,
                                                                        rowid: docprojs[_prj]['rowid'],
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
                                            logger.debug("OrgTree:%s", JSON.stringify(orgTree));
                                            if (counter >= docbgs.length - 1) {
                                                d4dModelNew.d4dModelMastersEnvironments.find({
                                                    id: 3,
                                                    orgname_rowid: {
                                                        $in: orgids
                                                    },
                                                    orgname_rowid: {
                                                        $in: objperms.orgs
                                                    }
                                                }, function(err, docenvs) {
                                                    logger.debug('Env Count : ' + JSON.stringify(docenvs) + ' permission : ' + objperms.orgs);
                                                    for (var _i = 0; _i < orgTree.length; _i++) {
                                                        for (var _env = 0; _env < docenvs.length; _env++) {
                                                            if (orgTree[_i]['rowid'] == docenvs[_env]['orgname_rowid']) {
                                                                var tenv = configmgmtDao.convertRowIDToValue(docenvs[_env]['rowid'], rowidlist)
                                                                orgTree[_i]['environments'].push({
                                                                    name: tenv,
                                                                    rowid: docenvs[_env]['rowid']
                                                                });
                                                            }
                                                        }
                                                        if (_i >= orgTree.length - 1) {
                                                            res.send(orgTree);
                                                            logger.debug("Exit get() for /organizations/getTreeNew");
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
            }
        }); //getTeamsOrgBuProjForUser 
    });

    app.get('/organizations/getTreeForbtv', function(req, res) {
        logger.debug("Enter get() for /organizations/getTreeForbtv");
        //console.log("Enter /organizations/getTreeForbtv");
        configmgmtDao.getTeamsOrgBuProjForUser(req.session.user.cn, function(err, objperms) {
            var orgTree = [];
            if (err) {
                logger.debug("Hit an error in getTeamsOrgBuProjForUser : " + err);
                res.send(orgTree);
                return;
            } else {
                logger.debug(' Returned from getTeamsOrgBuProjForUser : ' + JSON.stringify(objperms));
                if(objperms[0].orgs.length === 0){
                    res.send(orgTree);
                    return;
                }
                configmgmtDao.getRowids(function(err, rowidlist) {
                    d4dModelNew.d4dModelMastersOrg.find({
                        id: 1,
                        active: true,
                        rowid: {
                            $in: objperms[0].orgs
                        }
                    }, function(err, docorgs) {
                        var orgids = docorgs.map(function(docorgs1) {
                            return docorgs1.rowid;
                        });


                        var orgCount = 0;
                        orgids.forEach(function(k, v) {
                            //orgTree.push('{\"name\":\"' + k + '\",\"businessGroups\":[],\"environments\":[]}');
                            var orgname = configmgmtDao.convertRowIDToValue(k, rowidlist);
                            orgTree.push({
                                name: orgname,
                                text: orgname,
                                rowid: k,
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
                        logger.debug("Found Orgs");
                        d4dModelNew.d4dModelMastersProductGroup.find({
                            id: 2,
                            orgname_rowid: {
                                $in: orgids
                            },
                            rowid: {
                                $in: objperms[0].bunits
                            }
                        }, function(err, docbgs) {
                            if (docbgs.length <= 0) { //no bgs for any org return tree
                                logger.debug("Not found any BUs returing empty orgs");
                                res.send(orgTree);
                                return;
                            }
                            var counter = 0;
                            for (var k = 0; k < docbgs.length; k++) {
                                for (var i = 0; i < orgTree.length; i++) {
                                    //var orgname = configmgmtDao.convertRowIDToValue(docbgs[k]['orgname_rowid'],rowidlist);
                                    if (orgTree[i]['rowid'] == docbgs[k]['orgname_rowid']) {
                                        //  console.log('found' );
                                        var bgname = configmgmtDao.convertRowIDToValue(docbgs[k]['rowid'], rowidlist);
                                        orgTree[i]['businessGroups'].push({
                                            name: bgname,
                                            text: bgname,
                                            rowid: docbgs[k]['rowid'],
                                            href: 'javascript:void(0)',
                                            nodes: [],
                                            projects: []
                                        });
                                        orgTree[i]['nodes'].push({
                                            name: bgname,
                                            text: bgname.substring(0, 21),
                                            orgname: orgTree[i]['name'],
                                            orgid: orgTree[i]['rowid'],
                                            icon: 'fa fa-fw fa-1x fa-group',
                                            rowid: docbgs[k]['rowid'],
                                            borderColor: '#000',
                                            href: 'javascript:void(0)',
                                            nodes: [],
                                            selectable: false,
                                            itemtype: 'bg',
                                            projects: []
                                        });
                                        d4dModelNew.d4dModelMastersProjects.find({
                                            id: 4,
                                            orgname_rowid: orgTree[i]['rowid'],
                                            productgroupname_rowid: docbgs[k]['rowid'],
                                            rowid: {
                                                $in: objperms[0].projects
                                            }
                                        }, function(err, docprojs) {
                                            // console.log('Projects:' + docprojs);

                                            var prjids = docprojs.map(function(docprojs1) {
                                                return docprojs1.rowid;
                                            });
                                            logger.debug("Projects found:%s", prjids.length);
                                            for (var _i = 0; _i < orgTree.length; _i++) {
                                                logger.debug("Orgnames:%s", orgTree[_i]['name']);
                                                for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                                    logger.debug("businessGroups:%s%s and docprojs.length:%s", orgTree[_i]['businessGroups'], [__i]['name'], docprojs.length);
                                                    for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                                        if (docprojs[_bg]['orgname_rowid'] == orgTree[_i]['rowid'] && docprojs[_bg]['productgroupname_rowid'] == orgTree[_i]['businessGroups'][__i]['rowid']) {
                                                            if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                                for (var _prj = 0; _prj < docprojs.length; _prj++) {
                                                                    var envs = docprojs[_prj]['environmentname_rowid'].split(',');
                                                                    var envs_ = [];
                                                                    for (var nt = 0; nt < envs.length; nt++) {
                                                                        //fixing the length of the env name
                                                                        var envname = configmgmtDao.convertRowIDToValue(envs[nt], rowidlist);
                                                                        var ttp = '';
                                                                        if (envs[nt].length > 12) {
                                                                            ttp = envname;
                                                                            //envs[nt] = envname; //.substring(0, 12);
                                                                        }
                                                                        if (envname != '') { //was envs[nt].trim() != ''
                                                                            envs_.push({
                                                                                text: envname,
                                                                                href: '#ajax/Dev.html?org=' + orgTree[_i]['rowid'] + '&bg=' + orgTree[_i]['businessGroups'][__i]['rowid'] + '&projid=' + docprojs[_prj]['rowid'] + '&envid=' + envs[nt],
                                                                                orgname: orgTree[_i]['name'],
                                                                                orgid: orgTree[_i]['rowid'],
                                                                                rowid: envs[nt],
                                                                                projname: docprojs[_prj]['projectname'],
                                                                                bgname: orgTree[_i]['businessGroups'][__i]['name'],
                                                                                itemtype: 'env',
                                                                                tooltip: ttp,
                                                                                icon: 'fa fa-fw fa-1x fa-desktop'
                                                                            });
                                                                        }
                                                                    }
                                                                    // logger.debug("Env in:%s", docprojs);
                                                                    orgTree[_i]['businessGroups'][__i]['projects'].push({ //
                                                                        name: docprojs[_prj]['projectname'],
                                                                        environments: envs
                                                                    });
                                                                    var prjname = configmgmtDao.convertRowIDToValue(docprojs[_prj]['rowid'], rowidlist);
                                                                    // get features.appcard from app.config

                                                                    //console.log(appConfig);


                                                                    var selectable = !!appConfig.features.appcard
                                                                    orgTree[_i]['nodes'][__i]['nodes'].push({ //
                                                                        name: prjname,
                                                                        text: prjname,
                                                                        rowid: docprojs[_prj]['rowid'],
                                                                        orgname: orgTree[_i]['name'],
                                                                        orgid: orgTree[_i]['rowid'],
                                                                        bgname: orgTree[_i]['businessGroups'][__i]['name'],
                                                                        icon: 'fa fa-fw fa-1x fa-tasks',
                                                                        nodes: envs_,
                                                                        borderColor: '#000',
                                                                        selectable: selectable,
                                                                        itemtype: 'proj',
                                                                        href: selectable ? '#ajax/ProjectSummary.html?org=' + orgTree[_i]['rowid'] + '&bg=' + orgTree[_i]['businessGroups'][__i]['rowid'] + '&projid=' + docprojs[_prj]['rowid'] : 'javascript:void(0)',
                                                                        //background: '#40baf1',
                                                                        //color: '#40baf1 !important',
                                                                        environments: envs
                                                                    });
                                                                    //javascript:void(0) #ajax/ProjectSummary.html?projid=' + docprojs[_prj]['rowid']
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
                                            logger.debug("OrgTree:%s", JSON.stringify(orgTree));
                                            if (counter >= docbgs.length - 1) {
                                                d4dModelNew.d4dModelMastersEnvironments.find({
                                                    id: 3,
                                                    orgname_rowid: {
                                                        $in: orgids
                                                    }
                                                }, function(err, docenvs) {
                                                    for (var _i = 0; _i < orgTree.length; _i++) {
                                                        for (var _env = 0; _env < docenvs.length; _env++) {
                                                            if (orgTree[_i]['name'] == docenvs[_env]['orgname']) {
                                                                var envname = configmgmtDao.convertRowIDToValue(docenvs[_env]['rowid'], rowidlist);
                                                                orgTree[_i]['environments'].push(envname);
                                                            }
                                                        }
                                                        if (_i >= orgTree.length - 1) {
                                                            res.send(orgTree);
                                                            logger.debug("Exit get() for /organizations/getTreeForbtv");
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
                }); //getRowids
            } //end of else getTeamsOrgBuProjForUser err
        }); // getTeamsOrgBuProjForUser
    });
    app.get('/organizations/getTree', function(req, res) {
        logger.debug("Enter get() for /organizations/getTree");
        d4dModelNew.d4dModelMastersOrg.find({
            id: 1,

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
                                    logger.debug("Orgnames:%s", orgTree[_i]['name']);
                                    for (var __i = 0; __i < orgTree[_i]['businessGroups'].length; __i++) {
                                        logger.debug("businessGroups:%s%s and docprojs.length:%s", orgTree[_i]['businessGroups'], [__i]['name'], docprojs.length);
                                        for (var _bg = 0; _bg < docprojs.length; _bg++) {

                                            if (docprojs[_bg]['orgname'] == orgTree[_i]['name'] && docprojs[_bg]['productgroupname'] == orgTree[_i]['businessGroups'][__i]['name']) {
                                                if (orgTree[_i]['businessGroups'][__i]['projects'].length <= 0) {
                                                    for (var prjname in prjnames)
                                                        orgTree[_i]['businessGroups'][__i]['projects'].push(prjnames[prjname]);
                                                }

                                                logger.debug("Env:%s", docprojs[_bg]['environmentname']);
                                                // if(orgTree[_i]['environments'].length <=0){
                                                //     for(var envname in docprojs[_bg]['environmentname'])
                                                //          orgTree[_i]['environments'].push(docprojs[_bg]['environmentname'][envname]);
                                                // }
                                            }
                                        }
                                    }
                                }
                                logger.debug("OrgTree:%s", JSON.stringify(orgTree));
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
                                                logger.debug("Exit get() for /organizations/getTree");
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
        logger.debug("Enter get() for /organizations/getTreeOld");
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
            logger.debug("Exit get() for /organizations/getTreeOld");
        });

    });


    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/blueprints', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/blueprints", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
        //getting the list of projects and confirming if user has permission on project

        blueprintsDao.getBlueprintsByOrgBgProjectAndEnvId(req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.query.blueprintType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });

        logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/blueprints", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
    });


    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/blueprints', function(req, res) {
        logger.debug("Enter post() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/blueprints", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.params.providerId, req.params.imageId);

        //validating if user has permission to save a blueprint
        logger.debug('Verifying User permission set');
        var user = req.session.user;
        var category = 'blueprints';
        var permissionto = 'create';

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);

                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }
            logger.debug("Provider Id: ", req.body.providerId);
            var blueprintData = req.body.blueprintData;
            blueprintData.orgId = req.params.orgId;
            blueprintData.bgId = req.params.bgId;
            blueprintData.projectId = req.params.projectId;
            //blueprintData.envId = req.params.envId;

            //logger.debug("Enviornment ID:: ", req.params.envId);
            //blueprintData.imageId = req.body.imageId;
            // blueprintData.providerId = req.body.providerId;
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
            logger.debug("Exit post() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/providers/%s/images/%s/blueprints", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.params.providerId, req.params.imageId);
        });
    });


    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/instances', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/instances", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
        instancesDao.getInstancesByOrgBgProjectAndEnvId(req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.query.instanceType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
        logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/instances", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
    });

    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/tasks', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
        Task.getTasksByOrgBgProjectAndEnvId(req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
        logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
    });

    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/applications', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/applications", req.params.orgId, req.params.bgId, req.params.projectId);
        Application.getAppCardsByOrgBgAndProjectId(req.params.orgId, req.params.bgId, req.params.projectId, function(err, applications) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(applications);
        });
        logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/applications", req.params.orgId, req.params.bgId, req.params.projectId);

    });

    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/applications/:applicationId/build/:buildId', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (application) {
                application.getBuild(function(err, build) {
                    if (err) {
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    res.send(build)
                });
            } else {
                res.send(404, {
                    message: "application not founds"
                });
            }
        });
    });

    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/applications', function(req, res) {
        console.log(req.files);
        console.log(req.body.appData);
        logger.debug("Enter post() for /organizations/%s/businessgroups/%s/projects/%s/applications", req.params.orgId, req.params.bgId, req.params.projectId);
        var appData = req.body.appData;
        appData.orgId = req.params.orgId;
        appData.bgId = req.params.bgId;
        appData.projectId = req.params.projectId;
        Application.createNew(appData, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
        logger.debug("Exit post() for /organizations/%s/businessgroups/%s/projects/%s/applications", req.params.orgId, req.params.bgId, req.params.projectId);
    });


    app.get('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
        configmgmtDao.getTeamsOrgBuProjForUser(req.session.user.cn, function(err, orgbuprojs) {
            logger.debug('-----------------------------------------------------getTeamsOrgBuProjForUser : ' + JSON.stringify(orgbuprojs));
            if (JSON.stringify(orgbuprojs) === 'null') {
                logger.debug('User not part of team to see project.');
                res.send(401, "User not part of team to see project.");
                return;
            }

            if (!err) {
                if (typeof orgbuprojs.projects !== "undefined" && orgbuprojs.projects.indexOf(req.params.projectId) >= 0) {
                    Task.getTasksByOrgBgProjectAndEnvId(req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, function(err, tasksData) {
                        if (err) {
                            res.send(500);
                            return;
                        }
                        instancesDao.getInstancesByOrgBgProjectAndEnvId(req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.query.instanceType, req.session.user.cn, function(err, instancesData) {
                            if (err) {
                                res.send(500);
                                return;
                            }
                            blueprintsDao.getBlueprintsByOrgBgProject(req.params.orgId, req.params.bgId, req.params.projectId, req.query.blueprintType, req.session.user.cn, function(err, blueprintsData) {
                                console.log(req.params.orgId, req.params.projectId, req.params.envId);
                                if (err) {
                                    res.send(500);
                                    return;
                                }
                                res.send({
                                    tasks: tasksData,
                                    instances: instancesData,
                                    blueprints: blueprintsData
                                });
                                logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
                            });

                        });

                    });
                } //if(orgbuprojs.orgbuprojs.indexOf(req.params.projectId) >= 0)
                else {
                    logger.debug('User not part of team to see project.');
                    res.send(401);
                    return;
                }
            } else {
                res.send(500);
                logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
                return;
            }
        }); //end getTeamsOrgBuProjForUser
    });

    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/tasks', function(req, res) {
        logger.debug("Enter post() for /organizations/%s/businessGroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.environments);
        var taskData = req.body.taskData;
        taskData.orgId = req.params.orgId;
        taskData.bgId = req.params.bgId;
        taskData.projectId = req.params.projectId;
        taskData.envId = req.params.envId;
        Task.createNew(taskData, function(err, task) {
            if (err) {
                logger.err(err);
                res.send(500);
                return;
            }
            res.send(task);
            logger.debug("Exit post() for /organizations/%s/businessGroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.environments);
        });
    });

    app.get('/organizations/:orgId/chefserver', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/chefserver", req.params.orgId);
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgId, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata%s", chefDetails);
            if (!chefDetails) {
                res.send(404);
                return;
            } else {
                res.send(chefDetails);
                logger.debug("Exit get() for /organizations/%s/chefserver", req.params.orgId);
            }
        });
    });

    app.get('/organizations/:orgname/cookbooks', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/cookbooks", req.params.orgname);
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname, function(err, chefDetails) {
            if (err) {
                res.send(500);
                logger.error(err);
                return;
            }
            logger.debug("chefdata%s", chefDetails);


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
                    logger.debug("Exit get() for /organizations/%s/cookbooks", req.params.orgname);
                }
            });

        });

    });

    app.get('/organizations/:orgname/roles', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/roles", req.params.orgname);
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname, function(err, chefDetails) {
            if (err) {
                res.send("There is some Internal Server Error. ", 500);
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
                    logger.debug("Exit get() for /organizations/%s/roles", req.params.orgname);
                }
            });
        });
    });

    app.get('/organizations/:orgname/chefRunlist', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/chefRunlist", req.params.orgname);
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
                            logger.debug("Exit get() for /organizations/%s/chefRunlist", req.params.orgname);
                        }
                    });
                }
            });

        });

    });
    app.get('/organizations/usechefserver/:chefserverid/chefRunlist', function(req, res) {
        logger.debug("Enter get() for /organizations/usechefserver/%s/chefRunlist", req.params.orgname);
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
                            logger.debug("Exit get() for /organizations/usechefserver/%s/chefRunlist", req.params.orgname);
                        }
                    });
                }
            });

        });

    });


    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/addInstance', function(req, res) {
        logger.debug("Enter post() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/addInstance", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);

        if (!(req.body.fqdn && req.body.os)) {
            res.send(400);
        }
        logger.debug('Verifying User permission set');
        var user = req.session.user;
        var category = 'instancelaunch';
        var permissionto = 'execute';

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);

                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }
            instancesDao.getInstanceByOrgAndNodeNameOrIP(req.params.orgId, req.body.fqdn, req.body.fqdn, function(err, instances) {
                if (err) {
                    logger.error("error occured while fetching instances by IP", err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                if (instances.length) {
                    res.send(400, {
                        message: "An Instance with the same IP already exists."
                    });
                    return;
                }
                logger.debug("Received Users: %s", req.body.users);
                if (req.body.credentials && req.body.credentials.username) {
                    if (!(req.body.credentials.password || req.body.credentials.pemFileData)) {
                        res.send(400);
                    }
                } else {
                    res.send(400);
                }

                configmgmtDao.getEnvNameFromEnvId(req.params.envId, function(err, envName) {
                    if (err) {
                        res.send(500);
                        return;
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
                            var openport = 22;
                            if (req.body.os === 'windows') {
                                openport = 5985;
                            }
                            waitForPort(req.body.fqdn, openport, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.send(400, {
                                        message: "Unable to SSH into instance"
                                    });
                                    return;
                                }
                                //    console.log('node ===>', node);
                                credentialCryptography.encryptCredential(credentials, function(err, encryptedCredentials) {
                                    if (err) {
                                        logger.error("unable to encrypt credentials", err);
                                        res.send(500);
                                        return;
                                    }
                                    if (!req.body.appUrls) {
                                        req.body.appUrls = [];
                                    }


                                    var appUrls = req.body.appUrls;
                                    if (appConfig.appUrls && appConfig.appUrls.length) {
                                        appUrls = appUrls.concat(appConfig.appUrls);
                                    }


                                    var instance = {
                                        name: req.body.fqdn,
                                        orgId: req.params.orgId,
                                        bgId: req.params.bgId,
                                        projectId: req.params.projectId,
                                        envId: req.params.envId,
                                        instanceIP: req.body.fqdn,
                                        instanceState: nodeAlive,
                                        bootStrapStatus: 'waiting',
                                        runlist: [],
                                        appUrls: appUrls,
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
                                            logger.error('Unable to create Instance ', err);
                                            res.send(500);
                                            return;
                                        }
                                        instance.id = data._id;
                                        instance._id = data._id;
                                        var timestampStarded = new Date().getTime();
                                        var actionLog = instancesDao.insertBootstrapActionLog(instance.id, [], req.session.user.cn, timestampStarded);
                                        var logsRefernceIds = [instance.id, actionLog._id];
                                        logsDao.insertLog({
                                            referenceId: logsRefernceIds,
                                            err: false,
                                            log: "Bootstrapping instance",
                                            timestamp: timestampStarded
                                        });

                                        credentialCryptography.decryptCredential(encryptedCredentials, function(err, decryptedCredentials) {
                                            if (err) {
                                                logger.error("unable to decrypt credentials", err);
                                                var timestampEnded = new Date().getTime();
                                                logsDao.insertLog({
                                                    referenceId: logsRefernceIds,
                                                    err: true,
                                                    log: "Unable to decrypt credentials. Bootstrap Failed",
                                                    timestamp: timestampEnded
                                                });
                                                instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);
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
                                            logger.debug("decryptCredentials ==> %s", decryptedCredentials);
                                            if (decryptedCredentials.pemFileLocation) {
                                                opts.privateKey = decryptedCredentials.pemFileLocation;
                                            } else {
                                                opts.password = decryptedCredentials.password;
                                            }
                                            logger.debug("Node OS : %s", instance.hardware.os);
                                            logger.debug('Cleaning instance');
                                            chef.cleanChefonClient(opts, function(err, retCode) {
                                                logger.debug("Entering chef.bootstarp");
                                                chef.bootstrapInstance({
                                                    instanceIp: instance.instanceIP,
                                                    pemFilePath: decryptedCredentials.pemFileLocation,
                                                    instancePassword: decryptedCredentials.password,
                                                    instanceUsername: instance.credentials.username,
                                                    nodeName: instance.chef.chefNodeName,
                                                    environment: envName,
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
                                                        var timestampEnded = new Date().getTime();
                                                        logsDao.insertLog({
                                                            referenceId: logsRefernceIds,
                                                            err: true,
                                                            log: "Bootstrap Failed",
                                                            timestamp: timestampEnded
                                                        });
                                                        instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);



                                                    } else {
                                                        if (code == 0) {
                                                            instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
                                                                if (err) {
                                                                    logger.error("Unable to set instance bootstarp status. code 0");
                                                                } else {
                                                                    logger.debug("Instance bootstrap status set to success");
                                                                }
                                                            });
                                                            var timestampEnded = new Date().getTime();
                                                            logsDao.insertLog({
                                                                referenceId: logsRefernceIds,
                                                                err: false,
                                                                log: "Instance Bootstrapped Successfully",
                                                                timestamp: timestampEnded
                                                            });
                                                            instancesDao.updateActionLog(instance.id, actionLog._id, true, timestampEnded);


                                                            chef.getNode(instance.chef.chefNodeName, function(err, nodeData) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return;
                                                                }
                                                                var hardwareData = {};
                                                                hardwareData.architecture = nodeData.automatic.kernel.machine;
                                                                hardwareData.platform = nodeData.automatic.platform;
                                                                hardwareData.platformVersion = nodeData.automatic.platform_version;
                                                                hardwareData.memory = {
                                                                    total: 'unknown',
                                                                    free: 'unknown'
                                                                };
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

                                                            var timestampEnded = new Date().getTime();
                                                            logsDao.insertLog({
                                                                referenceId: logsRefernceIds,
                                                                err: true,
                                                                log: "Bootstrap Failed",
                                                                timestamp: timestampEnded
                                                            });
                                                            instancesDao.updateActionLog(instance.id, actionLog._id, false, timestampEnded);

                                                        }
                                                    }

                                                }, function(stdOutData) {

                                                    logsDao.insertLog({
                                                        referenceId: logsRefernceIds,
                                                        err: false,
                                                        log: stdOutData.toString('ascii'),
                                                        timestamp: new Date().getTime()
                                                    });

                                                }, function(stdErrData) {

                                                    logsDao.insertLog({
                                                        referenceId: logsRefernceIds,
                                                        err: true,
                                                        log: stdErrData.toString('ascii'),
                                                        timestamp: new Date().getTime()
                                                    });
                                                });
                                            }); //end of chefcleanup

                                        });
                                        res.send(instance);
                                        logger.debug("Exit post() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/addInstance", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
                                    });
                                });

                            });
                        });
                    });
                });
            });
        });
    });

    // For Docker Creation
    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId',function(req,res){
        logger.debug('test');
    });
    app.post('/organizations/:orgId/businessgroups/:bgId/projects/:projectId/blueprints/docker', function(req, res) {
        //validating if user has permission to save a blueprint
        logger.debug('Verifying User permission set');
        var user = req.session.user;
        var category = 'blueprints';
        var permissionto = 'create';

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401);

                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }
            logger.debug("Provider Id: ", req.body.providerId);
            var blueprintData = req.body.blueprintData;
            blueprintData.orgId = req.params.orgId;
            blueprintData.bgId = req.params.bgId;
            blueprintData.projectId = req.params.projectId;
            blueprintData.envId = req.params.envId;

            // for Docker
            blueprintData.imageId = '000000';
            blueprintData.providerId = '000000';
            blueprintData.keyPairId = '000000';
            blueprintData.subnetId = '000000';
            blueprintData.vpcId = '000000';
            blueprintData.securityGroupIds = ['000000'];
            logger.debug("Enviornment ID:: ", req.params.envId);

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
            logger.debug("Exit post() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/providers/%s/images/%s/blueprints", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId, req.params.providerId, req.params.imageId);
        });
    });
}