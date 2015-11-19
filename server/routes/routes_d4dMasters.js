/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Vinod Nair and Gobinda Das <gobinda.das@relevancelab.com>,
 * May 2015
 */

// This file act as a Controller which contains Settings related all end points.

var d4dModel = require('../model/d4dmasters/d4dmastersmodel.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var usersDao = require('../model/users.js');
var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');
var Curl = require('../lib/utils/curl.js');
var appConfig = require('_pr/config');
var logger = require('_pr/logger')(module);
var childProcess = require('child_process');
var exec = childProcess.exec;
var masterUtil = require('../lib/utils/masterUtil.js');
var blueprintsDao = require('../model/dao/blueprints');
var errorResponses = require('./error_responses.js');
var bcrypt = require('bcryptjs');
var authUtil = require('../lib/utils/authUtil.js');
var Cryptography = require('../lib/utils/cryptography');

var cryptoConfig = appConfig.cryptoSettings;
var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

module.exports.setRoutes = function(app, sessionVerification) {

    app.all('/d4dMasters/*', sessionVerification);


    /*app.get('/d4dMasters/saveTest', function(req, res) {
        var m = new d4dModel();
        m.save(function(err, data) {
            console.log(data);
            res.send(data);
        });
    })*/
    app.get('/d4dmasters/dockervalidate/:username/:password', function(req, res) {
        logger.debug("Enter get() for /d4dmasters/dockervalidate/%s/%s", req.params.username, req.params.password);
        var cmd = 'curl --raw -L --user ' + req.params.username + ':' + req.params.password + ' https://index.docker.io/v1/users';
        var curl = new Curl();
        curl.executecurl(cmd, function(err, stdout) {
            if (err) {
                res.end(err);
            }
            if (stdout) {
                if (stdout.indexOf('OK') > 0) {
                    res.end('200');
                } else {
                    logger.debug("No User");
                    res.end('402');
                }
            }
        });
        logger.debug("Exit get() for /d4dmasters/dockervalidate/%s/%s", req.params.username, req.params.password);

    });

    app.get('/d4dmasters/instanceping/:ip', function(req, res) {
        logger.debug("Enter get() for /d4dmasters/instanceping/%s", req.params.ip);
        var cmd = 'ping -c 1 -w 1 ' + req.params.ip;
        var curl = new Curl();
        console.log("Pinging Node to check if alive :" + cmd);
        curl.executecurl(cmd, function(err, stdout) {
            if (err) {
                res.end(err);
            }
            if (stdout) {
                if (stdout.indexOf('1 received') > 0) {
                    //res.send();
                    res.end('Alive');
                    //res.send('200');
                    logger.debug("Exit get() for /d4dmasters/instanceping/%s", req.params.ip);
                    return;

                } else {
                    logger.debug('Not Found');
                    //res.send('400 Not Found');\
                    res.end('Not Alive');
                    // res.send('200');
                    return;
                }
            }
        });
    });

    app.get('/d4dmasters/getdockertags/:repopath/:dockerreponame', function(req, res) {
        logger.debug("Enter get() for /d4dmasters/getdockertags/%s/%s", req.params.repopath, req.params.dockerreponame);
        //fetch the username and password from 
        //Need to populate dockerrowid in template card. - done
        logger.debug('hit getdockertags');
        configmgmtDao.getMasterRow(18, 'dockerreponame', req.params.dockerreponame, function(err, data) {
            if (!err) {

                var dockerRepo = JSON.parse(data);
                logger.debug("Docker Repo ->%s", JSON.stringify(dockerRepo));
                logger.debug("Docker Repopath ->%s", req.params.repopath);
                var cmd = '';
                //Below is for public repository
                cmd = 'curl -v -H "Accept: application/json" -X GET https://' + dockerRepo.dockeruserid + ':' + dockerRepo.dockerpassword + '@index.docker.io/v1/repositories/' + req.params.repopath.replace(/\$\$/g, '/') + '/tags';
                //Below is for private repository
                //cmd = 'curl --user ' + dockerRepo.dockeruserid + ':' + dockerRepo.dockerpassword + ' -X GET https://index.docker.io/v1/' + dockerRepo.dockerrepopath + '/' + req.params.repopath +  '/tags';
                logger.debug("executing - %s", cmd);
                var curl = new Curl();
                curl.executecurl(cmd, function(err, stdout) {
                    if (err) {
                        logger.error("Error occured: ", err);
                        res.end(err);
                    }
                    if (stdout) {
                        if (stdout.indexOf('404:') > 0) {
                            logger.debug("No Data");
                            res.end('402');

                        } else {
                            logger.debug("Received JSON");
                            logger.debug("Exit get() for /d4dmasters/getdockertags/%s/%s", req.params.repopath, req.params.dockerreponame);
                            res.end(stdout);
                        }
                    }
                });

            } else {
                logger.error("Error:", err);
                res.end(err);
            }
        });

        /*  */

    });


    app.get('/d4dMasters/mastersjson', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/mastersjson");
        res.send([{
            name: 'master'
        }, {
            name: 'master2'
        }]);
        logger.debug("Exit get() for /d4dMasters/mastersjson");
    });
    //getAccessFilesForRole
    app.get('/d4dMasters/getaccessroles/:loginname', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/getaccessroles/%s", req.params.loginname);
        configmgmtDao.getAccessFilesForRole(req.params.loginname, req, res, function(err, getAccessFiles) {
            if (getAccessFiles) {
                getAccessFiles = getAccessFiles.replace(/\"/g, '').replace(/\:/g, '')
                logger.debug("Rcvd in call: %s", getAccessFiles);
                req.session.user.authorizedfiles = getAccessFiles;
                res.end(req.session.user.authorizedfiles);
            }
        });
        logger.debug("Exit get() for /d4dMasters/getaccessroles/%s", req.params.loginname);
    });

    app.get('/d4dMasters/getaccessroles/:masterid/:fieldname/:filedvalue', function(req, res) {
        //configmgmtDao.getListFiltered(req.params.masterid,req.params.fieldname,req.params.fieldname)

    });

    app.get('/d4dMasters/getcodelist/:name', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/getcodelist/%s", req.params.name);
        configmgmtDao.getCodeList(req.params.name, function(err, cl) {
            if (cl) {
                logger.debug("Closing");
                res.end(cl);
            }
        });
        logger.debug("Exit get() for /d4dMasters/getcodelist/%s", req.params.name);
    });

    app.get('/d4dMasters/getuser', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/getuser : " + JSON.stringify(req.session.user));
        res.send({
            "user": [{
                username: req.session.user
            }, {
                role: '[' + req.session.user.roleId + ']'
            }]
        });
        logger.debug("Exit get() for /d4dMasters/getuser");


        // var query = {};
        // console.log(req.session.user);
        // query['loginname'] = req.session.user.cn; //building the query 
        // query['id'] = '7';

        // console.log(req.session.user.cn);

        // d4dModelNew.d4dModelMastersUsers.find(query, function(err, d4dMasterJson) {
        //     if (err) {
        //         console.log("Hit and error:" + err);
        //     }
        //     res.end(JSON.stringify(d4dMasterJson));
        //     console.log("sent response" + JSON.stringify(d4dMasterJson));
        // });

    });

    app.get('/d4dMasters/authorizedfiles', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/authorizedfiles");
        res.send('[' + req.session.user.authorizedfiles + ']');
        logger.debug("Exit get() for /d4dMasters/authorizedfiles");
    });

    app.get('/d4dMasters/candelete/:rowid/:formid', function(req, res) {

        // swtich(req.params.formid){
        //    case "1": //this will be org

        // }
        // configmgmtDao.deleteCheck(req.params.rowid,formids,fieldname,function(err,data){

        // });

    });

    app.get('/d4dMasters/setting', function(req, res) {
        configmgmtDao.getTeamsOrgBuProjForUser(req.session.user.cn, function(err, data) {
            logger.debug('Retuened setting : ' + data);
            res.send(200);
        });
    });

    app.get('/d4dMasters/removeitem/:id/:fieldname/:fieldvalue', function(req, res) {
        logger.debug("Received request for delete chk. %s : %s : %s", req.params.fieldvalue, req.params.id, req.params.fieldname);
        // console.log('received request ' + req.params.id);
        logger.debug('Verifying User permission set for delete.');
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID(req.params.id);
        var permissionto = 'delete';
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (err) {
                logger.debug('Returned from haspermission : ' + data + ' , Condition State : ' + (data == false));
                /*if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.end('401');

                    return;
                }
            } else {*/
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.send(500, "Failed to fetch User.");
                }
                logger.debug("LoggedIn User:>>>> ", JSON.stringify(anUser));
                if (anUser) {
                    //data == true (create permission)
                    /*if (!data) {
                        logger.debug("Inside check not authorized.");
                        res.send(401, "You don't have permission to perform this operation.");
                        return;
                    }*/

                    var tocheck = [];
                    var fieldname = '';
                    switch (req.params.id) {
                        case "1":
                            tocheck.push('2');
                            tocheck.push('3');
                            tocheck.push('10');
                            fieldname = "orgname_rowid";
                            break;
                        case "2":
                            tocheck.push('4');
                            fieldname = "productgroupname_rowid";
                            break;
                        case "3":
                            tocheck.push('4');
                            fieldname = "environmentname_rowid,orgname_rowid";
                            break;
                        case "4":
                            tocheck.push('blueprints');
                            tocheck.push('instances');
                            fieldname = "projectId";
                            break;
                        case "10":
                            tocheck.push('all');
                            fieldname = "configname_rowid";
                            break;
                        case "19":
                            tocheck.push('blueprints');
                            tocheck.push('instances');
                            fieldname = "projectId";
                            break;
                    }

                    masterUtil.getTemplateTypesById(req.params.fieldvalue, function(err, templateTypeData) {
                        if (err) {
                            res.send(500, "Error from DB");
                            return;
                        }
                        if (templateTypeData.length > 0) {
                            blueprintsDao.getBlueprintByTemplateType(templateTypeData[0].templatetypename, function(err, bpData) {
                                if (err) {
                                    res.send(500, "Error from DB.");
                                    return;
                                }
                                logger.debug(">>>>>>>>>>>>>>>>>>>>> ", bpData.length);
                                /*if(bpData.length > 0){
                                    res.send(500,"TemplateType can't be deleted,It's used by some BluePrint.");
                                    return;
                                }*/

                                configmgmtDao.deleteCheck(req.params.fieldvalue, tocheck, fieldname, function(err, data) {
                                    logger.debug("Delete check returned: %s", data);
                                    if (data == "none") {
                                        logger.debug("entering delete");
                                        configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                                            if (err) {
                                                logger.debug("Hit and error:", err);
                                            }
                                            if (dbtype) {
                                                //Currently rowid is hardcoded since variable declaration was working
                                                logger.debug("Data from DB: >>>>>>>>>>>>>", JSON.stringify(dbtype));
                                                var item = '\"' + req.params.fieldname + '\"';
                                                logger.debug("About to delete Master Type: %s : % : %", dbtype, item, req.params.fieldvalue);
                                                //res.send(500);
                                                eval('d4dModelNew.' + dbtype).remove({
                                                    rowid: req.params.fieldvalue
                                                }, function(err) {
                                                    if (err) {
                                                        logger.debug("Hit an errror on delete : %s", err);
                                                        res.send(500);
                                                        return;
                                                    } else {
                                                        logger.debug("Document deleted : %s", req.params.fieldvalue);
                                                        res.send(200);
                                                        logger.debug("Exit get() for /d4dMasters/removeitem/%s/%s/%s", req.params.id, req.params.fieldname, req.params.fieldvalue);
                                                        return;
                                                    }
                                                }); //end findOne
                                            }
                                        }); //end configmgmtDao
                                    } else {
                                        logger.debug("There are dependent elements cannot delete");
                                        res.send(412, "Cannot proceed with delete. \n Dependent elements found");
                                        return;
                                    }
                                }); //deleteCheck
                            });
                        } else {
                            configmgmtDao.deleteCheck(req.params.fieldvalue, tocheck, fieldname, function(err, data) {
                                logger.debug("Delete check returned: %s", data);
                                if (data == "none") {
                                    logger.debug("entering delete");
                                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                                        if (err) {
                                            logger.debug("Hit and error:", err);
                                        }
                                        if (dbtype) {
                                            //Currently rowid is hardcoded since variable declaration was working
                                            logger.debug("Data from DB: >>>>>>>>>>>>>", JSON.stringify(dbtype));
                                            var item = '\"' + req.params.fieldname + '\"';
                                            logger.debug("About to delete Master Type: %s : % : %", dbtype, item, req.params.fieldvalue);
                                            //res.send(500);
                                            eval('d4dModelNew.' + dbtype).remove({
                                                rowid: req.params.fieldvalue
                                            }, function(err) {
                                                if (err) {
                                                    logger.debug("Hit an errror on delete : %s", err);
                                                    res.send(500);
                                                    return;
                                                } else {
                                                    logger.debug("Document deleted : %s", req.params.fieldvalue);
                                                    res.send(200);
                                                    logger.debug("Exit get() for /d4dMasters/removeitem/%s/%s/%s", req.params.id, req.params.fieldname, req.params.fieldvalue);
                                                    return;
                                                }
                                            }); //end findOne
                                        }
                                    }); //end configmgmtDao
                                } else {
                                    logger.debug("There are dependent elements cannot delete");
                                    res.send(412, "Cannot proceed with delete. \n Dependent elements found");
                                    return;
                                }
                            }); //deleteCheck
                        }

                    });

                }
            });
        }); //haspermission
    });

    //Reading a icon file saved
    app.get('/d4dMasters/image/:imagename', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/image/%s", req.params.imagename);
        var settings = appConfig.chef;
        var chefRepoPath = settings.chefReposLocation;
        console.log(chefRepoPath);
        var file = chefRepoPath + 'catalyst_files/' + req.params.imagename;
        logger.debug("File:>>>>>>>>>>>> %s", file);
        fs.exists(file, function(exists) {
            if (exists) {
                fs.readFile(chefRepoPath + 'catalyst_files/' + req.params.imagename, function(err, data) {
                    if (err) {
                        logger.debug("File not founnd>>>>>>>>");
                        res.end(404);
                        return;
                    }
                    res.writeHead(200, {
                        'Content-Type': 'image/gif'
                    });
                    res.end(data, 'binary');
                });
            } else {
                res.send(404);
            }
        });
        logger.debug("Exit get() for /d4dMasters/image/%s", req.params.imagename);
    });
    app.get('/d4dMasters/readmasterjson/:id', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjson/%s", req.params.id);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                // res.send(200, d4dMasterJson);
                //  res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                // res.json(d4dMasterJson);
                //res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(d4dMasterJson));
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                //res.end();
            } else {
                res.send(400, {
                    "error": err
                });
                logger.debug("none found");
            }
            logger.debug("Exit get() for /d4dMasters/readmasterjson/%s", req.params.id);

        });
    });

    app.get('/d4dMasters/readmasterjsonrecord/:id/:rowid', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjsonrecord/%s/%s", req.params.id, req.params.rowid);
        configmgmtDao.getRowids(function(err, rowidlist) {
            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                if (err) {
                    logger.error("Hit and error:", err);
                }
                if (dbtype) {
                    logger.debug("Master Type: %s", dbtype)
                    eval('d4dModelNew.' + dbtype).findOne({
                        rowid: req.params.rowid
                    }, function(err, d4dMasterJson) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (d4dMasterJson) {
                            // res.send(200, d4dMasterJson);
                            //  res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            // res.json(d4dMasterJson);
                            //res.setHeader('Content-Type', 'application/json');

                            //Change any _rowid references to the name

                            //var __keys = Object.keys(d4dMasterJson[k]);

                            //console.log('OBject:' + d4dMasterJson[k]);
                            var jobj = JSON.parse(JSON.stringify(d4dMasterJson));

                            for (var k1 in jobj) {
                                //if any key has _rowid then update corresponding field
                                //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                if (k1.indexOf('_rowid') > 0) {

                                    var flds = k1.split('_');
                                    var names = '';
                                    if (jobj[k1].indexOf(',') > 0) {
                                        //Will handle this seperately : Vinod to Do
                                        var itms = jobj[k1].split(',');
                                        for (_itms in itms) {
                                            logger.debug("in items");
                                            if (names == '') {
                                                names = configmgmtDao.convertRowIDToValue(itms[_itms], rowidlist);
                                            } else {
                                                names += ',' + configmgmtDao.convertRowIDToValue(itms[_itms], rowidlist);
                                            }
                                            logger.debug("names: %s", names);
                                        }

                                    } else {
                                        names = configmgmtDao.convertRowIDToValue(jobj[k1], rowidlist)
                                    }





                                    d4dMasterJson[flds[0]] = names; //configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist);

                                    // console.log('jobj[flds[0]]',d4dMasterJson[flds[0]],flds[0],k1);
                                }
                                //console.log("key***:",k1," val***:",jobj[k1]);

                            }
                            //console.log("sent response" + JSON.stringify(d4dMasterJson));
                            //res.end(JSON.stringify(d4dMasterJson));

                            // console.log(k,d4dMasterJson[k],v);


                            res.end(JSON.stringify(d4dMasterJson));
                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            logger.debug("Exit get() for /d4dMasters/readmasterjsonrecord/%s/%s", req.params.id, req.params.rowid);
                            //res.end();
                        } else {
                            res.end(JSON.stringify([]));
                            logger.debug("none found");
                        }


                    });
                }
            });
        }); //getRowids

    });

    app.get('/d4dMasters/readmasterjsonnew__/:id', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjsonnew__/%s", req.params.id);
        d4dModelNew.d4dModelMastersOrg.find({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.debug("Hit and error:", err);
            }
            if (d4dMasterJson) {
                //
                // res.send(200, d4dMasterJson);
                //  res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                // res.json(d4dMasterJson);
                //res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(d4dMasterJson));
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                logger.debug("Exit get() for /d4dMasters/readmasterjsonnew__/%s", req.params.id);
                //res.end();
            } else {
                res.send(400, {
                    "error": err
                });
                logger.debug("none found");
            }


        });
    });

    app.get('/d4dMasters/readmasterjsonnew/:id', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjsonnew/%s", req.params.id);
        logger.debug("Logged in user: ", req.session.user.cn);
        logger.debug("incomming id:>>>>>>>>>>>>>>>>>>>> ", req.params.id);
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.send(500, "Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.send(500, "Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                /*d4dModelNew.find({
                    id: req.params.id
                }, function(err, data) {
                    if (err) {
                        logger.debug("Unable to fetch Settings.");
                        res.send(500, "Unable to fetch Settings for Id: ", req.params.id);
                    }
                    logger.debug("Called /d4dMasters/readmasterjsonnew/ for superadmin.");
                    if (req.params.id === "16") {
                        res.send(JSON.stringify(data));
                        return;
                    } else {
                        res.send(data);
                    }
                });*/

                // For Org
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    logger.debug("got org list ==>", JSON.stringify(orgList));
                    if (err) {
                        res.send(500, 'Not able to fetch Orgs.');
                        return;
                    } else if (req.params.id === '1') {
                        //logger.debug("Returned Org List:>>>> ", JSON.stringify(orgList));
                        res.send(orgList);
                        return;
                    }
                    // for(var i=0;i<orgList.length;i++){
                    //(function(count){
                    else if (req.params.id === '2') {
                        // For BusinessGroup
                        masterUtil.getBusinessGroups(orgList, function(err, bgList) {
                            if (err) {
                                res.send(500, 'Not able to fetch BG.');
                            }
                            //logger.debug("Returned BG List:>>>> ", JSON.stringify(bgList));
                            res.send(bgList);
                            return;
                        });
                    } else if (req.params.id === '3') {
                        // For Environment
                        masterUtil.getEnvironments(orgList, function(err, envList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ENV.');
                            }
                            //logger.debug("Returned ENV List:>>>>> ", JSON.stringify(envList));
                            res.send(envList);
                            return;
                        });
                    } else if (req.params.id === '4') {
                        // For Projects
                        masterUtil.getProjects(orgList, function(err, projectList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Project.');
                            }
                            //logger.debug("Returned Project List:>>>>> ", JSON.stringify(projectList));
                            res.send(projectList);
                            return;
                        })
                    } else if (req.params.id === '10') {
                        // For ConfigManagement
                        masterUtil.getCongifMgmts(orgList, function(err, configMgmtList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ConfigManagement.');
                            }
                            //logger.debug("Returned ConfigManagement List:>>>>> ", configMgmtList);
                            res.send(configMgmtList);
                            return;
                        });

                    } else if (req.params.id === '18') {
                        // For Docker
                        logger.debug("Id for docker:>> ", req.params.id);
                        masterUtil.getDockers(orgList, function(err, dockerList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Dockers.');
                            }
                            //logger.debug("Returned Dockers List:>>>>> ", JSON.stringify(dockerList));
                            res.send(dockerList);
                            return;
                        });

                    } else if (req.params.id === '17') {
                        // For Template
                        logger.debug("Id for template:>> ", req.params.id);
                        masterUtil.getTemplates(orgList, function(err, templateList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Template.');
                            }
                            //logger.debug("Returned Template List:>>>>> ", JSON.stringify(templateList));
                            res.send(templateList);
                            return;
                        });

                    } else if (req.params.id === '16') {
                        // For Template
                        logger.debug("Id for templateType:>> ", req.params.id);
                        masterUtil.getTemplateTypes(orgList, function(err, templateList) {
                            if (err) {
                                res.send(500, 'Not able to fetch TemplateType.');
                            }
                            //logger.debug("Returned TemplateType List:>>>>> ",JSON.stringify(templateList));
                            res.send(JSON.stringify(templateList));
                            return;
                        });

                        /*d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
                            id: req.params.id
                        }, function(err, data) {
                            if (err) {
                                logger.debug("Unable to fetch TemplateType.");
                                res.send(500, "Unable to fetch TemplateType for Id: ", req.params.id);
                            }
                            logger.debug("Called /d4dMasters/readmasterjsonnew/ for non superadmin.");
                            res.send(JSON.stringify(data));
                        });*/

                    } else if (req.params.id === '19') {
                        // For ServiceCommand
                        masterUtil.getServiceCommands(orgList, function(err, serviceCommandList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ServiceCommand.');
                            }
                            //logger.debug("Returned ServiceCommand List:>>>>> ", JSON.stringify(serviceCommandList));
                            res.send(serviceCommandList);
                            return;
                        });

                    } else if (req.params.id === '20') {
                        // For Jenkins
                        masterUtil.getJenkins(orgList, function(err, jenkinList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Jenkins.');
                            }
                            //logger.debug("Returned Jenkins List:>>>>> ", JSON.stringify(jenkinList));
                            res.send(jenkinList);
                            return;
                        });

                    } else if (req.params.id === '6') {
                        // For User Role
                        masterUtil.getUserRoles(function(err, userRoleList) {
                            if (err) {
                                res.send(500, 'Not able to fetch UserRole.');
                            }
                            //logger.debug("Returned UserRole List:>>>>> ", JSON.stringify(userRoleList));
                            res.send(userRoleList);
                            return;
                        });

                    } else if (req.params.id === '7') {
                        // For User
                        masterUtil.getUsersForOrgOrAll(orgList, function(err, userList) {
                            if (err) {
                                res.send(500, 'Not able to fetch User.');
                            }
                            //logger.debug("Returned User List:>>>>> ", JSON.stringify(userList));
                            res.send(userList);
                            return;
                        });

                    } else if (req.params.id === '21') {
                        // For Team
                        masterUtil.getTeams(orgList, function(err, teamList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Team.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(teamList);
                            return;
                        });
                    } else if (req.params.id === '25') {
                        // For Puppet Server
                        masterUtil.getPuppetServers(orgList, function(err, pList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Puppet Server.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(pList);
                            return;
                        });
                    } else if (req.params.id === '26') {
                        // For Puppet Server
                        masterUtil.getNexusServers(orgList, function(err, pList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Nexus Server.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(pList);
                            return;
                        });
                    } else {
                        logger.debug('nothin here');
                        res.send([]);
                    }
                });

                // For non-catalystadmin
            } else {
                logger.debug("incomming id:>>>>>>>>>>>>>>>>>>>> ", req.params.id);
                // For Org
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    logger.debug("got org list ==>", JSON.stringify(orgList));
                    if (err) {
                        res.send(500, 'Not able to fetch Orgs.');
                        return;
                    } else if (req.params.id === '1') {
                        //logger.debug("Returned Org List:>>>> ", JSON.stringify(orgList));
                        res.send(orgList);
                        return;
                    }
                    // for(var i=0;i<orgList.length;i++){
                    //(function(count){
                    else if (req.params.id === '2') {
                        // For BusinessGroup
                        masterUtil.getBusinessGroups(orgList, function(err, bgList) {
                            if (err) {
                                res.send(500, 'Not able to fetch BG.');
                            }
                            //logger.debug("Returned BG List:>>>> ", JSON.stringify(bgList));
                            res.send(bgList);
                            return;
                        });
                    } else if (req.params.id === '3') {
                        // For Environment
                        masterUtil.getEnvironments(orgList, function(err, envList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ENV.');
                            }
                            //logger.debug("Returned ENV List:>>>>> ", JSON.stringify(envList));
                            res.send(envList);
                            return;
                        });
                    } else if (req.params.id === '4') {
                        // For Projects
                        masterUtil.getProjects(orgList, function(err, projectList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Project.');
                            }
                            //logger.debug("Returned Project List:>>>>> ", JSON.stringify(projectList));
                            res.send(projectList);
                            return;
                        })
                    } else if (req.params.id === '10') {
                        // For ConfigManagement
                        masterUtil.getCongifMgmts(orgList, function(err, configMgmtList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ConfigManagement.');
                            }
                            //logger.debug("Returned ConfigManagement List:>>>>> ", configMgmtList);
                            res.send(configMgmtList);
                            return;
                        });

                    } else if (req.params.id === '18') {
                        // For Docker
                        logger.debug("Id for docker:>> ", req.params.id);
                        masterUtil.getDockers(orgList, function(err, dockerList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Dockers.');
                            }
                            //logger.debug("Returned Dockers List:>>>>> ", JSON.stringify(dockerList));
                            res.send(dockerList);
                            return;
                        });

                    } else if (req.params.id === '17') {
                        // For Template
                        logger.debug("Id for template:>> ", req.params.id);
                        masterUtil.getTemplates(orgList, function(err, templateList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Template.');
                            }
                            //logger.debug("Returned Template List:>>>>> ", JSON.stringify(templateList));
                            res.send(templateList);
                            return;
                        });

                    } else if (req.params.id === '16') {
                        // For Template
                        logger.debug("Id for templateType:>> ", req.params.id);
                        masterUtil.getTemplateTypes(orgList, function(err, templateList) {
                            if (err) {
                                res.send(500, 'Not able to fetch TemplateType.');
                            }
                            //logger.debug("Returned TemplateType List:>>>>> ",JSON.stringify(templateList));
                            res.send(JSON.stringify(templateList));
                            return;
                        });

                        /*d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
                            id: req.params.id
                        }, function(err, data) {
                            if (err) {
                                logger.debug("Unable to fetch TemplateType.");
                                res.send(500, "Unable to fetch TemplateType for Id: ", req.params.id);
                            }
                            logger.debug("Called /d4dMasters/readmasterjsonnew/ for non superadmin.");
                            res.send(JSON.stringify(data));
                        });*/

                    } else if (req.params.id === '19') {
                        // For ServiceCommand
                        masterUtil.getServiceCommands(orgList, function(err, serviceCommandList) {
                            if (err) {
                                res.send(500, 'Not able to fetch ServiceCommand.');
                            }
                            //logger.debug("Returned ServiceCommand List:>>>>> ", JSON.stringify(serviceCommandList));
                            res.send(serviceCommandList);
                            return;
                        });

                    } else if (req.params.id === '20') {
                        // For Jenkins
                        masterUtil.getJenkins(orgList, function(err, jenkinList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Jenkins.');
                            }
                            //logger.debug("Returned Jenkins List:>>>>> ", JSON.stringify(jenkinList));
                            res.send(jenkinList);
                            return;
                        });

                    } else if (req.params.id === '6') {
                        // For User Role
                        masterUtil.getUserRoles(function(err, userRoleList) {
                            if (err) {
                                res.send(500, 'Not able to fetch UserRole.');
                            }
                            //logger.debug("Returned UserRole List:>>>>> ", JSON.stringify(userRoleList));
                            res.send(userRoleList);
                            return;
                        });

                    } else if (req.params.id === '7') {
                        // For User
                        masterUtil.getUsersForOrg(orgList, function(err, userList) {
                            if (err) {
                                res.send(500, 'Not able to fetch User.');
                            }
                            //logger.debug("Returned User List:>>>>> ", JSON.stringify(userList));
                            res.send(userList);
                            return;
                        });

                    } else if (req.params.id === '21') {
                        // For Team
                        masterUtil.getTeams(orgList, function(err, teamList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Team.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(teamList);
                            return;
                        });
                    } else if (req.params.id === '25') {
                        // For Puppet Server
                        masterUtil.getPuppetServers(orgList, function(err, pList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Puppet Server.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(pList);
                            return;
                        });
                    } else if (req.params.id === '26') {
                        // For Puppet Server
                        masterUtil.getNexusServers(orgList, function(err, pList) {
                            if (err) {
                                res.send(500, 'Not able to fetch Nexus Server.');
                            }
                            //logger.debug("Returned Team List:>>>>> ", JSON.stringify(teamList));
                            res.send(pList);
                            return;
                        });
                    } else {
                        logger.debug('nothin here');
                        res.send([]);
                    }

                    //res.send(200,[]);

                    // })(i);
                    // }
                });
            }
        });

    });

    app.get('/d4dMasters/readmasterjsonneworglist/:id', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjsonneworglist/%s", req.params.id);
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.send(500, "Failed to fetch User.");
            }
            if (!anUser) {
                res.send(500, "Invalid User.");
            }
            if (anUser.orgname_rowid[0] === "") {
                configmgmtDao.getRowids(function(err, rowidlist) {

                    logger.debug("Rowid List----&&&&----> ", rowidlist);
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (dbtype) {
                            logger.debug("Master Type: %s", dbtype);

                            var query = {};

                            query['id'] = req.params.id;
                            if (req.params.id == '2' || req.params.id == '3' || req.params.id == '4' || req.params.id == '10') {
                                query['active'] = true;
                            }


                            eval('d4dModelNew.' + dbtype).find({
                                id: req.params.id
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    logger.debug("Hit and error:", err);
                                }
                                //Need to iterate thru the json and find if there is a field with _rowid then convert it to prefix before sending.
                                var _keys = Object.keys(d4dMasterJson);
                                logger.debug("Master Length:" + _keys.length);
                                if (_keys.length <= 0) {
                                    logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                                    res.end(JSON.stringify(d4dMasterJson));
                                }
                                var counter = 0;
                                var todelete = [];
                                //_keys.forEach(function(k,v){
                                for (var k = 0, v = 0; k < _keys.length; k++, v++) {
                                    //var __keys = Object.keys(d4dMasterJson[k]);

                                    //console.log('OBject:' + d4dMasterJson[k]);
                                    var jobj = JSON.parse(JSON.stringify(d4dMasterJson[k]));

                                    for (var k1 in jobj) {
                                        //if any key has _rowid then update     corresponding field
                                        //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                        if (k1.indexOf('_rowid') > 0) {
                                            //check if its an array of rowid's
                                            var flds = k1.split('_');
                                            var names = '';
                                            if (jobj[k1].indexOf(',') > 0) {
                                                //Will handle this seperately : Vinod to Do
                                                var itms = jobj[k1].split(',');
                                                for (_itms in itms) {
                                                    var _itmsName = configmgmtDao.convertRowIDToValue(itms[_itms], rowidlist);
                                                    if (_itmsName != '') {
                                                        if (names == '') {
                                                            names = _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        } else {
                                                            names += ',' + _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        }
                                                        logger.debug("names: %s", names);
                                                    }
                                                }

                                            } else {
                                                names = configmgmtDao.convertRowIDToValue(jobj[k1], rowidlist);
                                            }

                                            d4dMasterJson[k][flds[0]] = names;

                                            if (names == '' && k1.indexOf('orgname_rowid') >= 0)
                                                todelete.push(k);
                                            //console.log('jobj[flds[0]]',jobj[flds[0]]);
                                            logger.debug("jobj[flds[0]] %s %s %s %s", d4dMasterJson[k][flds[0]], flds[0], k1, k);
                                        }

                                        //  console.log("key**:",k1," val**:",jobj[k1]);

                                    }
                                    logger.debug("Orgname check: %s", d4dMasterJson[k]['orgname']);


                                    counter++;
                                }; //);
                                logger.debug("To Delete Array: %s", todelete.toString());
                                var collection = [];

                                for (var i = 0; i < d4dMasterJson.length; i++) {
                                    if (todelete.indexOf(i) === -1) {
                                        collection.push(d4dMasterJson[i]);
                                    }

                                }
                                logger.debug("sent response 686 %s", JSON.stringify(collection));
                                res.end(JSON.stringify(collection));
                                logger.debug("Exit get() for /d4dMasters/readmasterjsonneworglist/%s", req.params.id);
                            });
                        }
                    });
                }); //rowidlist
            } else {
                // For non-catalystadmin

                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (orgList) {
                        logger.debug("Returned Org List: >>>>>> ", JSON.stringify(orgList));
                        res.send(orgList);
                    }
                });

            }
        });
    });
    //for kana to be reverted to the original function 
    app.get('/d4dMasters/readmasterjsonnewk_/:id', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/readmasterjsonnewk_/%s", req.params.id);
        configmgmtDao.getRowids(function(err, rowidlist) {

            logger.debug("Rowid List-->", rowidlist);
            d4dModelNew.d4dModelMastersOrg.find({
                id: 1
            }, function(err, docorgs) {
                var orgnames = docorgs.map(function(docorgs1) {
                    return docorgs1.rowid;
                });
                if (req.params.id == '2' || req.params.id == '3' || req.params.id == '10') {
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (dbtype) {
                            logger.debug("Master Type: %s", dbtype);
                            eval('d4dModelNew.' + dbtype).find({
                                id: req.params.id,
                                orgname_rowid: {
                                    $in: orgnames
                                }
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    logger.error("Hit and error:", err);
                                }
                                //Need to iterate thru the json and find if there is a field with _rowid then convert it to prefix before sending.
                                var _keys = Object.keys(d4dMasterJson);
                                _keys.forEach(function(k, v) {
                                    //var __keys = Object.keys(d4dMasterJson[k]);

                                    //console.log('OBject:' + d4dMasterJson[k]);
                                    var jobj = JSON.parse(JSON.stringify(d4dMasterJson[k]));
                                    for (var k1 in jobj) {
                                        //if any key has _rowid then update corresponding field
                                        //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                        if (k1.indexOf('_rowid')) {
                                            var flds = k1.split('_');
                                            jobj[flds[0]] = configmgmtDao.convertRowIDToValue(jobj[k1], rowidlist);
                                        }
                                        logger.debug("key: %s val: %s", k1, jobj[k1]);

                                    }
                                });
                                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                                res.end(JSON.stringify(d4dMasterJson));

                                logger.debug("Exit get() for /d4dMasters/readmasterjsonnewk_/%s", req.params.id);
                            });
                        }
                    });
                } //end if (1,2,3,4)
                else if (req.params.id == '1' || req.params.id == '4') {
                    d4dModelNew.d4dModelMastersProductGroup.find({
                        id: 2,
                        rowid: {
                            $in: orgnames
                        }
                    }, function(err, docbgs) {
                        var bgnames = docbgs.map(function(docbgs1) {
                            return docbgs1.productgroupname;
                        });
                        configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                            if (err) {
                                logger.error("Hit and error:", err);
                            }
                            if (dbtype) {
                                logger.debug("Master Type: %s", dbtype);
                                eval('d4dModelNew.' + dbtype).find({
                                    id: req.params.id,
                                    productgroupname: {
                                        $in: bgnames
                                    }
                                }, function(err, d4dMasterJson) {
                                    if (err) {
                                        logger.error("Hit and error:", err);
                                    }
                                    res.end(JSON.stringify(d4dMasterJson));
                                    logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                                    logger.debug("Exit get() for /d4dMasters/readmasterjsonnewk_/%s", req.params.id);
                                });
                            }
                        });


                    });
                } else {
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (dbtype) {
                            logger.debug("Master Type: %s", dbtype);
                            eval('d4dModelNew.' + dbtype).find({
                                id: req.params.id
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    logger.error("Hit and error:", err);
                                }
                                res.end(JSON.stringify(d4dMasterJson));
                                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                                logger.debug("Exit get() for /d4dMasters/readmasterjsonnewk_/%s", req.params.id);
                            });
                        }
                    });
                } //end else
            });
        }); //get rowid list
    });


    app.get('/d4dMasters/readmasterjsoncounts', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/readmasterjsoncounts");
        logger.debug("Logged in User: ", req.session.user.cn);

        var ret = [];
        var masts = ['2', '3', '4'];
        var counts = [];
        masterUtil.getLoggedInUser(req.session.user.cn, function(err, anUser) {
            if (err) {
                res.send(500, "Failed to fetch User.");
            }
            if (!anUser) {
                res.send(500, "Invalid User.");
            }
            if (anUser.orgname_rowid[0] === "") {
                for (var i = 1; i < 5; i++)
                    counts[i] = 0;
                d4dModelNew.d4dModelMastersOrg.find({
                    id: 1,
                    active: true
                }, function(err, docorgs) {
                    var orgnames = docorgs.map(function(docorgs1) {
                        return docorgs1.rowid;
                    });
                    d4dModelNew.d4dModelMastersOrg.find({
                        id: {
                            $in: masts,
                        },
                        orgname_rowid: {
                            $in: orgnames
                        }
                    }, function(err, d4dMasterJson) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (d4dMasterJson) {
                            // res.send(200, d4dMasterJson);
                            // res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });

                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            logger.debug(d4dMasterJson.length);
                            var i = 0;
                            for (var i = 0; i < d4dMasterJson.length; i++) {
                                //Need to do a org check.

                                logger.debug(d4dMasterJson[i]["id"]);
                                counts[d4dMasterJson[i]["id"]]++;
                            }
                            for (var i = 2; i < 5; i++) {
                                ret.push('{"' + i + '":"' + counts[i] + '"}');
                            }
                            ret.push('{"1":"' + orgnames.length + '"}');
                            logger.debug("Configured json:>>>>> ", '[' + ret.join(',') + ']');
                            res.end('[' + ret.join(',') + ']');
                            //res.end();
                            logger.debug("Exit get() for  /d4dMasters/readmasterjsoncounts");
                            return;
                        } else {
                            //res.send(400, {
                            ret.push(i + ':' + '');
                            // "error": err
                            // });
                            logger.debug("none found");
                            res.send(ret);
                            return;
                        }
                    });
                });
            } else {
                // For Settings Button
                var settingsList = [];
                var loggedInUser = req.session.user.cn;
                var callCount = 0;
                masterUtil.getActiveOrgs(loggedInUser, function(err, orgs) {
                    logger.debug("got org list ==>", JSON.stringify(orgs));
                    if (err) {
                        res.send(500, "Failed to fetch Org.");
                    }
                    if (orgs) {
                        orgCount = orgs.length;
                        logger.debug("orgCount: ", orgCount);
                        if (settingsList.length === 0) {
                            settingsList.push({
                                "1": orgCount
                            });
                            logger.debug("Org if....");
                        }
                        for (var s = 0; s < settingsList.length; s++) {
                            logger.debug("Entered orgs.....");
                            (function(s1) {
                                if (settingsList[s1].hasOwnProperty("1")) {
                                    delete settingsList[s1];
                                    settingsList.push({
                                        "1": orgCount
                                    });
                                    settingsList = settingsList.filter(Object);
                                    return;
                                }
                            })(s);
                        }
                        //for(var x=0;x<orgs.length;x++){
                        //(function(countOrg){
                        logger.debug("Organization: ");
                        masterUtil.getBusinessGroups(orgs, function(err, bgs) {
                            if (err) {
                                res.send(500, "Failed to fetch BGroups");
                            }
                            if (bgs) {
                                bgCount = bgs.length;
                                logger.debug("bgCount: ", bgCount);
                                if (settingsList.length === 1) {
                                    settingsList.push({
                                        "2": bgCount
                                    });
                                    logger.debug("BG if....");
                                }
                                for (var s = 0; s < settingsList.length; s++) {
                                    (function(s1) {
                                        if (settingsList[s1].hasOwnProperty("2")) {
                                            delete settingsList[s1];
                                            settingsList.push({
                                                "2": bgCount
                                            });
                                            settingsList = settingsList.filter(Object);
                                            return;
                                        }
                                    })(s);
                                }
                            }
                            // });
                            masterUtil.getEnvironments(orgs, function(err, envs) {
                                if (err) {
                                    res.send(500, "Failed to fetch ENVs.");
                                }
                                if (envs) {
                                    envCount = envs.length;
                                    logger.debug("envCount: ", envCount);
                                    if (settingsList.length === 2) {
                                        settingsList.push({
                                            "3": envCount
                                        });
                                        logger.debug("Env if....");
                                    }
                                    for (var s = 0; s < settingsList.length; s++) {
                                        (function(s1) {
                                            if (settingsList[s1].hasOwnProperty("3")) {
                                                delete settingsList[s1];
                                                settingsList.push({
                                                    "3": envCount
                                                });
                                                settingsList = settingsList.filter(Object);
                                                return;
                                            }
                                        })(s);
                                    }
                                }
                                // });
                                masterUtil.getProjects(orgs, function(err, projects) {
                                    if (err) {
                                        res.send(500, "Failed to fetch Projects.");
                                    }
                                    if (projects) {
                                        projectCount = projects.length;
                                        logger.debug("projectCount: ", projectCount);
                                        if (settingsList.length === 3) {
                                            settingsList.push({
                                                "4": projectCount
                                            });
                                            logger.debug("Proj if....");
                                        }
                                        for (var s = 0; s < settingsList.length; s++) {
                                            (function(s1) {
                                                if (settingsList[s1].hasOwnProperty("4")) {
                                                    logger.debug("Has project.");
                                                    delete settingsList[s1];
                                                    settingsList.push({
                                                        "4": projectCount
                                                    });
                                                    settingsList = settingsList.filter(Object);
                                                    return;
                                                }
                                            })(s);
                                        }
                                    }
                                    /*callCount+=1;
                                        if(callCount === 3){*/
                                    logger.debug("All settings: ", JSON.stringify(settingsList));
                                    res.send(settingsList);
                                    // }
                                });
                            });
                        });

                        // })(x);
                        // }
                    } else {
                        res.send(200, settingsList);
                    }
                });
            } //else
        });

    });

    app.get('/d4dMasters/getdashboardvalues/:items', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getdashboardvalues/%s", req.params.items);
        var masts = [];
        masts = req.params.items.split(',');
        logger.debug("---Length-- %s", masts.length);
        logger.debug("Exit get() for  /d4dMasters/getdashboardvalues/%s", req.params.items);
    });

    app.get('/d4dMasters/qmasterjson/:id/:name', function(req, res) {

    });
    app.get('/d4dMasters/getprovider/:rowid', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getprovider/%s", req.params.rowid);
        d4dModel.findOne({
            id: '9'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'rowid') {
                            if (itm.field[j]["values"].value == req.params.rowid) {
                                logger.debug("found: %s  -- %s", i, itm.field[j]["values"].value);
                                hasOrg = true;
                                //Re-construct the json with the item found
                                var configmgmt = '';
                                for (var k = 0; k < itm.field.length; k++) {

                                    if (configmgmt == '')
                                        configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                    else
                                        configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";

                                }
                                configmgmt = "{" + configmgmt + "}";
                                logger.debug(JSON.stringify(configmgmt));
                            }
                        }
                    }
                }); // rows loop
            }
            logger.debug("Exit get() for  /d4dMasters/getprovider/%s", req.params.rowid);
        });

    });


    app.get('/d4dMasters/getlist/:masterid/:fieldname', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getlist/%s/%s", req.params.masterid, req.params.fieldname);
        d4dModel.findOne({
            id: req.params.masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var jsonlist = '';
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);
                    var rowid = '';
                    var fieldvalue = '';
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == req.params.fieldname) {
                            fieldvalue = itm.field[j]["values"].value;
                        }
                        if (itm.field[j]["name"] == "rowid") {
                            rowid = itm.field[j]["values"].value;
                        }
                    }
                    if (jsonlist == '')
                        jsonlist += "\"" + fieldvalue + "\":\"" + rowid + "\"";
                    else
                        jsonlist += ",\"" + fieldvalue + "\":\"" + rowid + "\"";

                });
                configmgmt = "{" + jsonlist + "}";
                logger.debug(JSON.stringify(jsonlist));
                logger.debug("Exit get() for  /d4dMasters/getlist/%s/%s", req.params.masterid, req.params.fieldname);
                //res.end(jsonlist);
            }
        });
    });

    app.get('/d4dMasters/getlist/:masterid/:fieldname/:fieldname1', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getlist/%s/%s/%s", req.params.masterid, req.params.fieldname, req.params.fieldname);
        d4dModel.findOne({
            id: req.params.masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
                res.end(null);
            }
            if (d4dMasterJson) {
                var jsonlist = '';
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);
                    var rowid = '';
                    var fieldvalue = '';
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == req.params.fieldname) {
                            fieldvalue = itm.field[j]["values"].value;
                        }
                        if (itm.field[j]["name"] == req.params.fieldname1) {
                            rowid = itm.field[j]["values"].value;
                        }
                    }
                    /* if(jsonlist == '')
                            jsonlist += "\"" + fieldvalue + "\":\"" +  rowid + "\"";
                       else
                            jsonlist += ",\"" + fieldvalue + "\":\"" +  rowid + "\""; */

                    if (jsonlist == '')
                        jsonlist += "{\"" + req.params.fieldname + "\":\"" + fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";
                    else
                        jsonlist += ",{\"" + req.params.fieldname + "\":\"" + fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";

                });
                configmgmt = "[" + jsonlist + "]";
                logger.debug(JSON.stringify(jsonlist));
                res.end(configmgmt);
                logger.debug("Exit get() for  /d4dMasters/getlist/%s/%s/%s", req.params.masterid, req.params.fieldname, req.params.fieldname);
            } else {
                res.send(404);
            }
        });
    });

    app.get('/d4dMasters/getorgnamebychefserver/:chefserver', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getorgnamebychefserver/%s", req.params.chefserver);
        configmgmtDao.getListFiltered(10, 'orgname', 'configname', req.params.chefserver, function(err, catorgname) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("catorgname: %s", catorgname);

            if (!catorgname) {
                res.send('');
                logger.debug("Exit get() for  /d4dMasters/getorgnamebychefserver/%s", req.params.chefserver);
                return;
            } else {
                res.end(catorgname);
                logger.debug("Exit get() for  /d4dMasters/getorgnamebychefserver/%s", req.params.chefserver);
                return;
            }


        });
    });
    app.post('/d4dMasters/getListFiltered/:masterid', function(req, res) {
        logger.debug("Enter post() for  /d4dMasters/getListFiltered/%s", req.params.masterid);
        if (req.params.masterid === "10" && typeof req.body.orgname != "undefined") {
            logger.debug("Request body   : ", JSON.stringify(req.body));
            var orgName = req.body.orgname;
            d4dModelNew.d4dModelMastersOrg.find({
                orgname: orgName,
                id: "1",
                active: true
            }, function(err, anOrg) {
                if (err) {
                    logger.debug("Error occored to get Org.");
                    return;
                }
                logger.debug("Got Org: >>>>> ", JSON.stringify(anOrg));
                if (anOrg.length) {
                    var query = {};
                    query['id'] = req.params.masterid;
                    query['orgname_rowid'] = anOrg[0].rowid;
                    d4dModelNew.d4dModelMastersConfigManagement.find(query, function(err, d4dMasterJson) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        logger.debug("getListFiltered %s", d4dMasterJson.length);
                        if (d4dMasterJson.length > 0) {
                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            res.send("Found");
                            logger.debug("Exit post() for  /d4dMasters/getListFiltered/%s", req.params.masterid);
                        } else {
                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            res.send("Not Found");
                        }

                    });
                } else {
                    res.send("Org Not Found");
                    return;
                }
            });
        } else {

            configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
                if (err) {
                    logger.error("Hit and error:", err);
                }

                if (dbtype) {
                    var query = {};
                    // query['rowid'] = {
                    //     '$in':req.body.serviceids
                    // }
                    query['id'] = req.params.masterid;
                    logger.debug("Req.body for glf %s", JSON.stringify(req.body));
                    var bodyJson = JSON.parse(JSON.stringify(req.body));

                    logger.debug("Query Build in getListFiltered: %s", JSON.stringify(bodyJson));
                    var _keys = Object.keys(bodyJson);
                    _keys.forEach(function(k, v) {
                        console.log(k, bodyJson[k]);
                        query[k] = bodyJson[k];
                    });
                    // bodyJson.forEach(function(k, v)    {
                    //     console.log('Object call to ' + k);
                    //     var _keys = Object.keys(k);
                    //     console.log(_keys + ' ' + k[_keys]);
                    //     query[_keys] = k[_keys];

                    // });
                    eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        logger.debug("getListFiltered %s", d4dMasterJson.length);
                        if (d4dMasterJson.length > 0) {
                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            res.send("Found");
                            logger.debug("Exit post() for  /d4dMasters/getListFiltered/%s", req.params.masterid);
                        } else {
                            logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                            res.send("Not Found");
                        }

                    });
                } else {
                    res.send(500);
                }
            });
        }
    });

    app.get('/d4dMasters/:masterid/:filtercolumnname/:filtercolumnvalue', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/%s/%s/%s", req.params.masterid, req.params.filtercolumnname, req.params.filtercolumnvalue);
        configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (dbtype) {
                var query = {};
                query[req.params.filtercolumnname] = req.params.filtercolumnvalue; //building the query 
                query['id'] = req.params.masterid;

                logger.debug("Master Type: %s", dbtype);
                eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                    if (err) {
                        logger.error("Hit and error:", err);
                    }
                    res.end(JSON.stringify(d4dMasterJson));
                    logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                    logger.debug("Exit get() for  /d4dMasters/%s/%s/%s", req.params.masterid, req.params.filtercolumnname, req.params.filtercolumnvalue);
                });
            }
        });
    });




    app.get('/d4dMasters/configmgmt/:rowid', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/configmgmt/%s", req.params.rowid);
        d4dModel.findOne({
            id: '10'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                settingsController.getChefSettings(function(settings) {
                    chefRepoPath = settings.chefReposLocation;
                    logger.debug("Repopath: %s", chefRepoPath);

                    var hasOrg = false;
                    d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                        logger.debug("found %s", itm.field.length);
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == 'rowid') {
                                if (itm.field[j]["values"].value == req.params.rowid) {
                                    logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                    hasOrg = true;
                                    //Re-construct the json with the item found
                                    var configmgmt = '';
                                    var orgname = '';
                                    var loginname = '';
                                    //looping to get the orgname , loginname
                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("login") >= 0)
                                            loginname = itm.field[k]["values"].value + "/";
                                        if (itm.field[k]["name"].indexOf("orgname") >= 0)
                                            orgname = itm.field[k]["values"].value + "/";
                                    }

                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("filename") > 0) {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";

                                        }
                                    }
                                    configmgmt = "{" + configmgmt + "}";
                                    logger.debug(JSON.stringify(configmgmt));
                                    logger.debug("Exit get() for  /d4dMasters/configmgmt/%s", req.params.rowid);
                                }
                            }

                            // console.log();
                        }
                    }); // rows loop
                }); //setting closure
            }
        });
    });

    app.get('/d4dMasters/getuuid', function(req, res) {
        logger.debug("Enter get() for  /d4dMasters/getuuid");
        var uuid1 = uuid.v4();
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        // res.json(d4dMasterJson);
        //res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(uuid1));
        logger.debug("sent response %s", JSON.stringify('{"uuid":"' + uuid1 + '"}'));
        logger.debug("Exit get() for  /d4dMasters/getuuid");
    });


    var fs = require('fs');
    var path = require('path');

    fs.mkdirParent = function(dirPath, mode, callback) {
        //Call the standard fs.mkdir
        fs.mkdir(dirPath, mode, function(error) {
            //When it fail in this way, do the custom steps
            if (error && error.errno === 34) {
                //Create all the parents recursively
                fs.mkdirParent(path.dirname(dirPath), mode, callback);
                //And then the directory
                fs.mkdirParent(dirPath, mode, callback);
            }
            //Manually run the callback since we used our own callback to do all these
            callback && callback(error);
        });
    };

    function mkdir_p(path, mode, callback, position) {
        mode = mode || 0777;
        position = position || 0;
        parts = require('path').normalize(path).split('/');
        var directory = parts.slice(0, position + 1).join('/');
        logger.debug("stage 2 %s", directory);
        fs.mkdirSync(directory, mode);
        if (position >= parts.length) {
            return (true);
        } else
            mkdir_p(path, mode, null, position + 1);
    }
    var mkdirSync1 = function(path) {
        try {
            fs.mkdirSync(path, 0777);
        } catch (e) {
            //if ( e.code != 'EEXIST' ) throw e;
        }
    }

    function updateProjectWithEnv(projects, bodyJson) {
        for (var p = 0; p < projects.length; p++) {
            (function(p) {
                if (projects[p].id === '4') {
                    var currproj = projects[p];
                    logger.debug('Project : ' + currproj);
                    d4dModelNew.d4dModelMastersProjects.findOne({
                        rowid: currproj.rowid,
                        id: '4'
                    }, function(err, data2) {
                        if (!err) {
                            var newenv = bodyJson['rowid'];
                            var envname = bodyJson['environmentname'];
                            if (data2 != null && typeof data2.environmentname_rowid != 'undefined' && data2.environmentname_rowid != '') {
                                if (data2.environmentname_rowid.indexOf(bodyJson['rowid']) === -1) {
                                    newenv = data2.environmentname_rowid + ',' + bodyJson['rowid'];
                                    envname = data2.environmentname + ',' + bodyJson['environmentname'];
                                }
                            }
                            if (newenv.charAt(0) === ",") {
                                newenv = newenv.slice(1);
                                envname = envname.slice(1);
                            }
                            logger.debug('Newenv ====>', newenv);
                            d4dModelNew.d4dModelMastersProjects.update({
                                rowid: currproj.rowid,
                                id: '4'
                            }, {
                                $set: {
                                    environmentname_rowid: newenv,
                                    environmentname: envname
                                }
                            }, {
                                upsert: false
                            }, function(err, data1) {
                                logger.debug("Update Count+++++++++++++++ ", data1);
                                if (err) {
                                    logger.debug('Err while updating d4dModelMastersProjects' + err);
                                    return;
                                }
                                logger.debug('Updated project ' + currproj + ' with env : ' + newenv);
                                return;
                            });
                        }
                    });
                }
            })(p);
        }
    };

    function updateProjectWithAllEnv(projects, bodyJson) {
        for (var p = 0; p < projects.length; p++) {
            (function(p) {
                if (projects[p].id === '4') {
                    var currproj = projects[p];
                    logger.debug('Project : ' + currproj);
                    d4dModelNew.d4dModelMastersProjects.findOne({
                        rowid: currproj.rowid,
                        id: '4'
                    }, function(err, data2) {
                        if (!err) {
                            var newenv = data2.environmentname_rowid;
                            var envname = data2.environmentname;
                            if (data2.environmentname_rowid === null) {
                                newenv = bodyJson['rowid'];
                                envname = bodyJson['environmentname'];
                            }
                            if (data2 != null && typeof data2.environmentname_rowid != 'undefined' && data2.environmentname_rowid != null) {
                                if (data2.environmentname_rowid.indexOf(bodyJson['rowid']) === -1) {
                                    newenv = data2.environmentname_rowid + ',' + bodyJson['rowid'];
                                    envname = data2.environmentname + ',' + bodyJson['environmentname'];
                                }
                            }
                            if (newenv.charAt(0) === ",") {
                                newenv = newenv.slice(1);
                                envname = envname.slice(1);
                            }

                            logger.debug('Newenv ====>', newenv.slice(1));
                            d4dModelNew.d4dModelMastersProjects.update({
                                rowid: currproj.rowid,
                                id: '4'
                            }, {
                                $set: {
                                    environmentname_rowid: newenv,
                                    environmentname: envname
                                }
                            }, {
                                upsert: false
                            }, function(err, data1) {
                                logger.debug("Update Count+++++++++++++++ ", data1);
                                if (err) {
                                    logger.debug('Err while updating d4dModelMastersProjects' + err);
                                    return;
                                }
                                logger.debug('Updated project ' + currproj + ' with env : ' + newenv);
                                return;
                            });
                        }
                    });
                }
            })(p);
        }
    };

    function findDeselectedItem(CurrentArray, PreviousArray) {
        var CurrentArrSize = CurrentArray.length;
        var PreviousArrSize = PreviousArray.length;
        var missing = [];
        // loop through previous array
        for (var j = 0; j < PreviousArrSize; j++) {

            // look for same thing in new array
            if (CurrentArray.indexOf(PreviousArray[j]) == -1) {
                missing.push(PreviousArray[j]);
            }

        }
        return missing;

    }

    function dissociateProjectWithEnv(projects, bodyJson) {
        for (var p = 0; p < projects.length; p++) {
            var currproj = projects[p];
            logger.debug('Project : ' + currproj);
            //if (!err) {

            var projectIds = bodyJson['projectname_rowid'].split(",");
            var newenv = bodyJson['rowid'];
            var newEnvName = bodyJson['environmentname'];
            d4dModelNew.d4dModelMastersEnvironments.find({
                id: "3",
                rowid: newenv
            }, function(err, envs) {
                if (err) {
                    logger.debug("Failed to fetch Env.", err);
                }
                if (envs) {
                    var projEnvId = envs[0].projectname_rowid;
                    var projEnvName = envs[0].projectname;
                    if (projEnvId.charAt(0) === ",") {
                        projEnvId = projEnvId.slice(1);
                        projEnvName = projEnvName.slice(1);
                    }
                    logger.debug("+++++++++++++++++++++++++================= ", projEnvId);

                    var PreviousArray = projEnvId.split(",");
                    var CurrentArray = projectIds;
                    var missing = findDeselectedItem(CurrentArray, PreviousArray);
                    var updatedEnvName = projEnvName.replace(newEnvName, '');
                    var updatedEnvId = projEnvId.replace(newenv, '');
                    for (var x = 0; x < missing.length; x++) {
                        (function(x) {
                            d4dModelNew.d4dModelMastersProjects.update({
                                rowid: missing[x],
                                id: '4'
                            }, {
                                $set: {
                                    environmentname_rowid: updatedEnvId,
                                    environmentname: updatedEnvName
                                }
                            }, {
                                upsert: false
                            }, function(err, data1) {
                                logger.debug("Update Count+++++++++++++++ ", data1);
                                if (err) {
                                    logger.debug('Err while updating d4dModelMastersProjects' + err);
                                    return;
                                }
                                logger.debug('Updated project ' + currproj + ' with env : ' + newenv);
                                return;
                            });
                        })(x);
                    }
                }
            });
            /* }
            })(p);*/
        }
    };

    function saveuploadedfile(suffix, folderpath, req) {
        logger.debug(req.body);
        var fi;
        if (req.params.fileinputs.indexOf(',') > 0)
            fi = req.params.fileinputs.split(',');
        else {
            fi = new Array();
            fi.push(req.params.fileinputs);
        }
        var bodyItems = Object.keys(req.body);
        var saveAsfileName = '';
        for (var i = 0; i < bodyItems.length; i++) {
            if (bodyItems[i].indexOf("_filename") > 0)
                saveAsfileName = req.body[bodyItems[i]];
        }


        var filesNames = Object.keys(req.files);
        var count = filesNames.length;
        logger.debug("in %s", count);
        filesNames.forEach(function(item) {
            logger.debug(item);
        });

        var settings = appConfig.chef;

        var chefRepoPath = settings.chefReposLocation;

        if (req.params.id === "25") {
            settings = appConfig.puppet;
            chefRepoPath = settings.puppetReposLocation;
        }



        logger.debug("Type of org : %s", typeof req.params.orgname);
        logger.debug("Org ID: %s", req.params.orgid);
        logger.debug(chefRepoPath + req.params.orgname + folderpath.substring(0, folderpath.length - 1));
        logger.debug("Orgname : # %s # %s", req.params.orgname.toString(), (req.params.orgname == ''));

        //Handling the exception to handle uploads without orgname
        if (req.params.orgname) {
            if (req.params.orgname === '/')
                req.params.orgname = '';

            if (req.params.orgname === '' || req.params.orgname === "undefined") {
                req.params.orgname = "catalyst_files";
            }
        }
        var path = chefRepoPath + req.params.orgid + folderpath.substring(0, folderpath.length - 1);



        //fs.mkdirParent(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1),0777); //if path is not present create it.
        parts = require('path').normalize(path).split('/');
        logger.debug("Length of parts: %s", parts.length);
        for (var i = 1; i <= parts.length; i++) {
            var directory = parts.slice(0, i).join('/');
            logger.debug(directory);
            mkdirSync1(directory);
            // fs.mkdirSync(directory,0777);
            //mkdir_p1(directory,'0777');
        }




        //mkdir_p(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1)); ///if path is not present create it.
        logger.debug("files: %s", fi.length);
        for (var i = 0; i < fi.length; i++) {
            var controlName = fi[i];
            var fil = eval('req.files.' + fi[i]);
            if (typeof fil != 'undefined') {

                var data = fs.readFileSync(fil.path); //, function(err, data) { 
                //var getDirName = require("path").dirname;
                /*fileIo.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data, null, function(err) {
                                    console.log(err);
                                    count--;
                                    if (count === 0) { // all files uploaded
                                        return("200");
                                    }
                                });*/
                if (folderpath == '') {
                    logger.debug("this is where file gets saved as (no folderpath): %s %s / %s %s __ %s", chefRepoPath, req.params.orgname, suffix, controlName, fil.name);
                    fs.writeFile(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);
                    logger.debug("File saved Successfully: ");
                } else {
                    if (folderpath.indexOf('.chef') > 0) { //identifying if its a chef config file
                        logger.debug("this is where file gets saved as .chef (with folderpath):    %s %s %s %s", chefRepoPath, req.params.orgid, folderpath, fil.name);
                        fs.writeFile(chefRepoPath + req.params.orgid + folderpath + fil.name, data);
                    } else if (folderpath.indexOf('.puppet') > 0) { //identifying if its a chef config file
                        logger.debug("this is where file gets saved as .chef (with folderpath) for puppet:    %s %s %s %s", chefRepoPath, req.params.orgid, folderpath, fil.name);
                        fs.writeFile(chefRepoPath + req.params.orgid + folderpath + fil.name, data);
                    } else //not a a chef config file
                    {
                        logger.debug("Folderpath rcvd: %s", folderpath);

                        if (fil.name == saveAsfileName) {
                            logger.debug("this is where file gets saved as (with folderpath): %s %s / %s %s __ %s", chefRepoPath, req.params.orgid, suffix, controlName, fil.name);
                            fs.writeFile(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);

                        } else {
                            logger.debug("this is where file gets saved as (with folderpath) fixed name: %s %s %s / %s", chefRepoPath, req.params.orgid, folderpath, saveAsfileName);
                            //fs.writeFileSync(chefRepoPath + folderpath.substring(1,folderpath.length) + fil.name, data);
                            fs.writeFile(chefRepoPath + req.params.orgname + folderpath + '/' + saveAsfileName, data);
                        }

                    }
                }


                //  });

            }
        }
        logger.debug("Before ssl fetch");
        if (req.params.id == '10') //Fix introduced for Kana 
        {
            logger.debug("In ssl fetch");
            var options = {
                cwd: chefRepoPath + req.params.orgid + folderpath,
                onError: function(err) {
                    callback(err, null);
                },
                onClose: function(code) {
                    callback(null, code);
                }
            };
            var cmdSSLFetch = 'knife ssl fetch';

            var procSSLFetch = exec(cmdSSLFetch, options, function(err, stdOut, stdErr) {
                if (err) {
                    logger.debug("Failed on procSSLFetch routes d4dMasters:", err);
                    return;
                }
            });
            procSSLFetch.on('close', function(code) {
                logger.debug("procSSLFetch done: ");
            });

            procSSLFetch.stdout.on('data', function(data) {
                //console.log('stdout: ==> ' + data);
                logger.debug("procSSLFetch : %s", data);
            });
        }
        /*else if (req.params.id == '25') //Fix introduced for Kana 
               {
                   logger.debug("In ssl fetch");
                   var options = {
                       cwd: chefRepoPath + req.params.orgid + folderpath,
                       onError: function(err) {
                           callback(err, null);
                       },
                       onClose: function(code) {
                           callback(null, code);
                       }
                   };
                   var cmdSSLFetch = 'knife ssl fetch';

                   var procSSLFetch = exec(cmdSSLFetch, options, function(err, stdOut, stdErr) {
                       if (err) {
                           logger.debug("Failed on procSSLFetch routes d4dMasters:", err);
                           return;
                       }
                   });
                   procSSLFetch.on('close', function(code) {
                       logger.debug("procSSLFetch done: ");
                   });

                   procSSLFetch.stdout.on('data', function(data) {
                       //console.log('stdout: ==> ' + data);
                       logger.debug("procSSLFetch : %s", data);
                   });
               }*/
        //res.send("200");
        return ("200");
    }


    app.post('/d4dmasters/getrows/:masterid', function(req, res) {
        logger.debug("Enter post() for  /d4dmasters/getrows/%s", req.params.masterid);
        configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (dbtype) {
                var query = {};
                query['rowid'] = {
                    '$in': req.body.serviceids
                }
                query['id'] = req.params.masterid;

                logger.debug("Master Type: %s", dbtype);
                eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                    if (err) {
                        logger.error("Hit and error:", err);
                    }
                    res.end(JSON.stringify(d4dMasterJson));
                    logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                    logger.debug("Exit post() for  /d4dmasters/getrows/%s", req.params.masterid);
                });
            } else {
                res.send(500);
            }
        });
    });

    app.post('/d4dMastersold/getrows/:masterid', function(req, res) {
        logger.debug("Enter post() for  /d4dMastersold/getrows/%s", req.params.masterid);
        d4dModel.findOne({
            id: req.params.masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var bodyJson = JSON.parse(JSON.stringify(req.body));

                if (bodyJson["serviceids"] != null) {
                    var root = '';
                    bodyJson["serviceids"].forEach(function(serviceid, servicecount) {
                        logger.debug("%s :: %s", serviceid, servicecount);

                        d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                            logger.debug("found %s", itm.field.length);


                            var configmgmt = '';
                            for (var j = 0; j < itm.field.length; j++) {
                                if (itm.field[j]["name"] == 'rowid') {
                                    if (itm.field[j]["values"].value == serviceid) {
                                        logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                        hasOrg = true;
                                        //Re-construct the json with the item found


                                        for (var k = 0; k < itm.field.length; k++) {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                        }
                                        // configmgmt = "{" + configmgmt + "}";
                                        // console.log(JSON.stringify(configmgmt));
                                        // res.end(configmgmt);
                                    }
                                }
                            }
                            if (configmgmt != '') {
                                if (root != '')
                                    root += ",{" + configmgmt + "}";
                                else
                                    root += "{" + configmgmt + "}";;

                            }

                        }); // rows loop


                    });
                    root = '[' + root + ']';

                    //console.log(JSON.stringify(root));
                    res.send(JSON.parse(root));
                    logger.debug("Exit post() for  /d4dMastersold/getrows/%s", req.params.masterid);

                }

            }

        });
    });

    app.post('/d4dMasters/savemasterjsonfull/:id', function(req, res) {
        logger.debug("Enter post() for  /d4dMasters/savemasterjsonfull/%s", req.params.id);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var bodyJson = JSON.parse(JSON.stringify(req.body));

                //pushing the rowid field
                var editMode = false; //to identify if in edit mode.
                var uuid1 = uuid.v4();
                var rowtoedit = null;
                if (bodyJson["rowid"] != null) { //for edit
                    editMode = true;
                    for (var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++) {
                        logger.debug("Value: %s", bodyJson["rowid"]);
                        if (d4dMasterJson.masterjson.rows.row[u].rowid == bodyJson["rowid"]) {
                            rowtoedit = d4dMasterJson.masterjson.rows.row[u];
                        }
                    }
                } else //for insert
                {
                    bodyJson["rowid"] = uuid1;
                }

                var frmkeys = Object.keys(bodyJson);
                var rowFLD = [];
                logger.debug(JSON.stringify(bodyJson));

                frmkeys.forEach(function(itm) {
                    if (!editMode) {
                        var thisVal = bodyJson[itm];
                        var item;

                        if (thisVal.indexOf('[') >= 0) //used to check if its an array
                            item = "{\"" + itm + "\" : " + thisVal + "}";
                        else
                            item = "{\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"}";

                        rowFLD.push(JSON.parse(item));
                    } else {

                    }
                });

                var FLD = "{" + JSON.stringify(rowFLD) + "}";
                logger.debug(FLD);
                logger.debug("Exit post() for  /d4dMasters/savemasterjsonfull/%s", req.params.id);
            }

        });
    });


    app.post('/d4dMasters/savemasterjsonrow/:id/:fileinputs/:orgname', function(req, res) {
        logger.debug('Enter post() for  /d4dMasters/savemasterjsonrow/%s/%s/%s', req.params.id, req.params.fileinputs, req.params.orgname);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {

                //{"orgname":"testingorg","domainname":"testingdomain","costcode":"[\"code1\",\"code2\",\"code3\"]"}
                //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";

                var bodyJson = JSON.parse(JSON.stringify(req.body));

                //pushing the rowid field
                var uuid1 = uuid.v4();
                var editMode = false; //to identify if in edit mode.
                var rowtoedit = null;
                if (bodyJson["rowid"] != null) {
                    editMode = true;
                    for (var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++) {
                        for (var i = 0; i < d4dMasterJson.masterjson.rows.row[u].field.length; i++) {
                            logger.debug("Value: %s", bodyJson[d4dMasterJson.masterjson.rows.row[u].field[i].name]);
                            if (d4dMasterJson.masterjson.rows.row[u].field[i].values.value == bodyJson["rowid"]) {

                                rowtoedit = d4dMasterJson.masterjson.rows.row[u];

                            }
                        }
                    }


                    /*d4dMasterJson.masterjson.rows.row.forEach(function(row){
                            for(var i = 0; i < row.field.length; i++){
                                console.log("Value:" + bodyJson[row.field[i].name]);
                                if(row.field[i].values.value == bodyJson["rowid"])
                                {
                                    
                                    rowtoedit = this;
                                    return(true);
                                }
                            }
                        }); */
                } else
                    bodyJson["rowid"] = uuid1;
                //console.log(bodyJson['orgname']);

                if (rowtoedit) //testing if the rowtoedit has a value
                    logger.debug("Edited Row: %s", JSON.stringify(rowtoedit));


                var frmkeys = Object.keys(bodyJson);

                //var frmvals = Object.keys(bodyJson);
                var rowFLD = [];
                //  var filesNames = Object.keys(req.files);
                var folderpath = ''; //will hold the folderpath field to create the path in the system

                logger.debug(JSON.stringify(bodyJson));

                frmkeys.forEach(function(itm) {
                    if (!editMode) {
                        var thisVal = bodyJson[itm];
                        //console.log(thisVal.replace(/\"/g,'\\"'));
                        logger.debug("thisVal %s", thisVal);
                        var item;

                        if (thisVal.indexOf('[') >= 0 && itm != "templatescookbooks") { //used to check if its an array
                            item = "{\"values\" : {\"value\" : " + thisVal + "},\"name\" : \"" + itm + "\"}";
                        } else
                            item = "{\"values\" : {\"value\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"},\"name\" : \"" + itm + "\"}";


                        rowFLD.push(JSON.parse(item));
                        if (itm == 'folderpath') { //special variable to hold the folder to which the files will be copied.
                            folderpath = thisVal;
                        }
                    } else { //in edit mode
                        if (rowtoedit) {
                            uuid1 = bodyJson["rowid"];
                            logger.debug("Bodyjson[folderpath]: %s", bodyJson["folderpath"]);
                            if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                folderpath = ''
                            else
                                folderpath = bodyJson["folderpath"];
                            for (var j = 0; j < rowtoedit.field.length; j++) {
                                if (bodyJson[rowtoedit.field[j].name] != null) {
                                    rowtoedit.field[j].values.value = bodyJson[rowtoedit.field[j].name];
                                    logger.debug("Entered Edit %s", rowtoedit.field[j].values.value);
                                }
                            }
                        }
                    }

                });
                logger.debug("Changed");
                var FLD = "{\"field\":" + JSON.stringify(rowFLD) + "}";
                //frmvals.push(rowFLD);
                logger.debug(FLD);
                if (!rowtoedit) { //push new values only when not in edit mode
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(FLD));
                }

                logger.debug(JSON.stringify(d4dMasterJson.masterjson));
                d4dModel.update({
                    "id": req.params.id
                }, {
                    $set: {
                        "masterjson": d4dMasterJson.masterjson
                    }
                }, {
                    upsert: false
                }, function(err, data) {
                    if (err) {
                        callback(err, null);
                        res.send(500);
                        return;
                    }
                    // To do save uploaded files.
                    //saveuploadedfile(suffix,fileinputs,orgname,req,res,callback)
                    logger.debug("folderpath: %s", folderpath);
                    //resetting the orgname when saving template
                    if (req.params.id == '17') {
                        req.params.orgname = '';
                    }
                    if (req.params.fileinputs != 'null')
                        res.send(saveuploadedfile(uuid1 + '__', folderpath, req));
                    else
                        res.send(200);

                    if (req.params.id == '10') {

                    }
                    //res.send(200);
                    //callback(null, data);
                    logger.debug("Exit post() for  /d4dMasters/savemasterjsonrow/%s/%s/%s", req.params.id, req.params.fileinputs, req.params.orgname);
                });
            }
        });
    });
    app.post('/d4dMasters/deactivateorg/:action', function(req, res) {
        logger.debug("Enter post() for /d4dMasters/deactivateorg/%s", req.params.action);
        var bodyJson = JSON.parse(JSON.stringify(req.body));

        if (!req.orgid) {
            logger.debug('Org ID found %s', bodyJson.orgid);
            configmgmtDao.deactivateOrg(bodyJson.orgid, req.params.action, function(err, data) {
                if (err) {
                    logger.error('Error: ', err);
                    res.send(500);
                }
                logger.debug('=== %s', data);
                res.send(200);
                logger.debug("Exit post() for /d4dMasters/deactivateorg/%s", req.params.action);
            });
        }

    });


    app.post('/d4dMasters/savemasterjsonrownew/:id/:fileinputs/:orgname', function(req, res) {
        logger.debug("Enter post() for /d4dMasters/savemasterjsonrownew/%s/%s/%s", req.params.id, req.params.fileinputs, req.params.orgname);
        var bodyJson = JSON.parse(JSON.stringify(req.body));
        //pushing the rowid field

        var editMode = false; //to identify if in edit mode.
        var rowtoedit = null;
        if (bodyJson["rowid"] != null) {
            editMode = true;
        } else {
            editMode = false;
            bodyJson["rowid"] = uuid.v4();
        }
        //Authorize user to create / modify.

        //function(username,category,permissionto,req,permissionset,callback){
        logger.debug('Users Session : ' + JSON.stringify(req.session.user));
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID(req.params.id);
        var permissionto = 'create';
        if (editMode == true) {
            permissionto = 'modify';
        }


        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                /*if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }*/
                res.send(500, "Server Error");
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.send(500, "Failed to fetch User.");
                }
                logger.debug("LoggedIn User:>>>> ", JSON.stringify(anUser));
                if (anUser) {
                    //data == true (create permission)
                    logger.debug("All condition:>>>>> data", data, " rowid: ", anUser.orgname_rowid[0], " role: ", anUser.userrolename);
                    /*if(data && anUser.orgname_rowid[0] !== "" && anUser.userrolename !== "Admin"){
                    logger.debug("Inside check not authorized.");
                    res.send(401,"You don't have permission to perform this operation.");
                    return;
                }*/

                    logger.debug('EditMode: %s', editMode);
                    bodyJson["id"] = req.params.id; //storing the form id.

                    // Handled for "any" field Org for User.
                    //logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",bodyJson["orgname"].length);
                    if (req.params.id === '7' && bodyJson["orgname"] === "") {
                        logger.debug("Inside if for empty");
                        bodyJson["orgname"] = "";
                        bodyJson["orgname_rowid"] = "";
                    }

                    if (req.params.id === "10") {
                        bodyJson["configType"] = "chef";
                    }
                    if (req.params.id === "26") {
                        bodyJson["configType"] = "nexus";
                    }
                    logger.debug("Full bodyJson:::: ", JSON.stringify(bodyJson));
                    if (req.params.id === "25") {
                        bodyJson["configType"] = "puppet";
                        if (bodyJson["puppetpassword"]) {
                            bodyJson["puppetpassword"] = cryptography.encryptText(bodyJson["puppetpassword"], cryptoConfig.encryptionEncoding, cryptoConfig.decryptionEncoding);
                        } else {
                            bodyJson["folderpath"] = "/" + bodyJson["username"] + "/.puppet/";
                        }
                        logger.debug("encryptText:>>>>>>>>>>>>> ", bodyJson["puppetpassword"]);
                    }
                    if (req.params.id === "3") {
                        if (!bodyJson["environmentname"]) {
                            bodyJson["environmentname"] = bodyJson["puppetenvironmentname"];
                        }
                    }
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            logger.error("Hit and error:", err);
                        }
                        if (dbtype) {
                            logger.debug("Master Type: %s", dbtype);

                            eval('d4dModelNew.' + dbtype).findOne({
                                rowid: bodyJson["rowid"]
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    logger.error("Hit and error:", err);
                                }
                                if (d4dMasterJson) {
                                    rowtoedit = JSON.parse(JSON.stringify(d4dMasterJson));
                                    logger.debug('<<<<< Reached here >>>> %s', (rowtoedit == null));
                                }
                                // if(!rowtoedit)
                                //  console.log("Edited Row:" + rowtoedit);

                                var frmkeys = Object.keys(bodyJson);
                                var orgid = '';
                                if (frmkeys.indexOf('orgname_rowid') >= 0) { //
                                    req.params['orgid'] = bodyJson['orgname_rowid'];
                                }

                                //var frmvals = Object.keys(bodyJson);
                                var rowFLD = [];
                                //  var filesNames = Object.keys(req.files);
                                var folderpath = ''; //will hold the folderpath field to create the path in the system

                                //       console.log('BodyJSON rowid:' + JSON.stringify(bodyJson));
                                var newrowid = '';
                                frmkeys.forEach(function(itm) {
                                    logger.debug("Each item: itm %s bodyJson[itm] %s", itm, bodyJson[itm]);
                                    if (itm.trim() == 'rowid') {
                                        logger.debug('!!!! in rowid %s', bodyJson[itm]);
                                        newrowid = bodyJson[itm];
                                    }
                                    if (!editMode) {
                                        var thisVal = bodyJson[itm];
                                        logger.debug(thisVal);
                                        var item = null;
                                        if (thisVal.indexOf('[') >= 0 && itm != "templatescookbooks") { //used to check if its an array
                                            item = "\"" + itm + "\" : \"" + thisVal + "\"";
                                        } else //
                                            item = "\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"";
                                        rowFLD.push(item);
                                        if (itm == 'folderpath') { //special variable to hold the folder to which the files will be copied.
                                            rowFLD.push("\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"");
                                            logger.debug('Got a folderpath: %s', thisVal);
                                            folderpath = thisVal;
                                        }
                                    } else {
                                        if (d4dMasterJson != null) {
                                            uuid1 = bodyJson["rowid"];
                                            //    console.log('Bodyjson[folderpath]:' + bodyJson["folderpath"]);
                                            // console.log('rowtoedit :' + JSON.stringify(rowtoedit) + ' : ' + JSON.stringify(bodyJson) );

                                            if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                                folderpath = ''
                                            else
                                                folderpath = bodyJson["folderpath"];
                                            var fldadded = false;
                                            for (var myval in rowtoedit) {
                                                if (itm == myval) {
                                                    rowtoedit[myval] = bodyJson[myval];
                                                    fldadded = true;
                                                }
                                                //   console.log("itm " + itm + " myval:" + myval + " value : " + rowtoedit[myval]);
                                            }
                                            if (!fldadded) {
                                                logger.debug('Not Added ---------> %s', itm);
                                                if (bodyJson[itm] != '') //found to have a value
                                                {
                                                    rowtoedit[itm] = bodyJson[itm];
                                                    //  console.log('New Entity :' + rowtoedit[myval]);
                                                }
                                            }
                                            // for(var myval in d4dMasterJson){
                                            //      console.log("key:"+myval+", value:");
                                            // //   d4dMasterJson[myval] = bodyJson[myval];

                                            // }
                                            //console.log(JSON.stringify(d4dMasterJson));
                                        }
                                    }
                                });
                                var FLD = JSON.stringify(rowFLD);
                                if (!editMode) { //push new values only when not in edit mode
                                    //dMasterJson = JSON.parse(FLD);
                                    //   console.log('>>>>>> Whats going to be saved:' + FLD['rowid']);


                                    // Start Auto create Team
                                    if (req.params.id === '1') {
                                        var orgData = {
                                            "orgname": bodyJson['orgname'],
                                            "domainname": bodyJson['domainname'],
                                            "rowid": bodyJson['rowid'],
                                            "id": "1"
                                        }
                                        var orgObj = new d4dModelNew.d4dModelMastersOrg(orgData);
                                        orgObj.save(function(err, anOrg) {
                                            if (err) {
                                                res.send(500, "Failed to save Org.");
                                                return;
                                            }
                                            for (var x1 = 0; x1 < 4; x1++) {
                                                (function(x1) {
                                                    var templatetypename;
                                                    var designtemplateicon_filename;
                                                    var templatetype;
                                                    if (x1 === 0) {
                                                        templatetypename = "SoftwareStack";
                                                        designtemplateicon_filename = "Appfactory.png";
                                                        templatetype = "chef";
                                                    } else if (x1 === 1) {
                                                        templatetypename = "OSImages";
                                                        designtemplateicon_filename = "Desktop Provisining.png";
                                                        templatetype = "ami";
                                                    } else if (x1 === 2) {
                                                        templatetypename = "CloudFormation";
                                                        designtemplateicon_filename = "CloudFormation.png";
                                                        templatetype = "cft";
                                                    } else {
                                                        templatetypename = "Docker";
                                                        designtemplateicon_filename = "Docker.png";
                                                        templatetype = "docker";
                                                    }

                                                    var templateTypeData = {
                                                        "templatetypename": templatetypename,
                                                        "orgname": bodyJson["orgname"],
                                                        "orgname_rowid": bodyJson["rowid"],
                                                        "rowid": uuid.v4(),
                                                        "id": "16",
                                                        "templatetype": templatetype

                                                    };

                                                    var templateTypeModel = new d4dModelNew.d4dModelMastersDesignTemplateTypes(templateTypeData);
                                                    templateTypeModel.save(function(err, aTemplateType) {
                                                        if (err) {
                                                            //res.send(500,"Failed to save Team.");
                                                            logger.debug("Failed to save TemplateType.");
                                                        }
                                                        logger.debug("Default TemplateType created.");
                                                    });
                                                })(x1);
                                            }
                                            for (var x = 0; x < 4; x++) {
                                                (function(x) {
                                                    var teamName;
                                                    var descriptions;
                                                    if (x === 0) {
                                                        teamName = bodyJson["orgname"] + "_Admins";
                                                        descriptions = "Team For " + teamName;
                                                    } else if (x === 1) {
                                                        teamName = bodyJson["orgname"] + "_DEV";
                                                        descriptions = "Team For " + teamName;
                                                    } else if (x === 2) {
                                                        teamName = bodyJson["orgname"] + "_QA";
                                                        descriptions = "Team For " + teamName;
                                                    } else {
                                                        teamName = bodyJson["orgname"] + "_DevOps";
                                                        descriptions = "Team For " + teamName;
                                                    }

                                                    logger.debug("orgname_rowid>>>>>>>>>>>>>>>> ", bodyJson["rowid"]);

                                                    var teamData = {
                                                        "teamname": teamName,
                                                        "description": descriptions,
                                                        "orgname": bodyJson["orgname"],
                                                        "orgname_rowid": bodyJson["rowid"],
                                                        "rowid": uuid.v4(),
                                                        "id": "21",
                                                        "loginname": "",
                                                        "loginname_rowid": "",
                                                        "projectname": "",
                                                        "projectname_rowid": ""

                                                    };
                                                    logger.debug("teamData>>>>>>>>>>>>>>>>>>>>>>>> ", teamData);
                                                    var teamModel = new d4dModelNew.d4dModelMastersTeams(teamData);
                                                    teamModel.save(function(err, aTeam) {
                                                        if (err) {
                                                            //res.send(500,"Failed to save Team.");
                                                            logger.debug("Failed to save Team.");
                                                        }
                                                        logger.debug("Auto created Team:>>>>>>>> ", JSON.stringify(aTeam));
                                                    });
                                                    if (x === 3) {
                                                        res.send(200);
                                                        return;
                                                    }
                                                })(x);

                                            }

                                        });
                                    } else if (req.params.id === '7') {
                                        authUtil.hashPassword(bodyJson["password"], function(err, hashedPassword) {
                                            if (err) {
                                                logger.error('Hit error', err);
                                                res.send(500);
                                                return;
                                            }
                                            logger.debug("hashedPassword: ", hashedPassword);
                                            bodyJson["password"] = hashedPassword;
                                            var userModel = new d4dModelNew.d4dModelMastersUsers(bodyJson);
                                            userModel.save(function(err, data) {
                                                if (err) {
                                                    logger.error('Hit Save error', err);
                                                    res.send(500);
                                                    return;

                                                }
                                                var teamName = bodyJson["teamname"].split(",");
                                                var rowId = bodyJson["teamname_rowid"].split(",");
                                                for (var x = 0; x < rowId.length; x++) {
                                                    d4dModelNew.d4dModelMastersTeams.find({
                                                        rowid: rowId[x]
                                                    }, function(err, teamData) {
                                                        if (err) {
                                                            logger.debug("Error : ", err);
                                                        }
                                                        logger.debug("Got Teams<<<<<<<<<<<<<<<<<<<<< ", JSON.stringify(teamData));
                                                        teamData[0].loginname = teamData[0].loginname + "," + bodyJson["loginname"];
                                                        teamData[0].loginname_rowid = teamData[0].loginname_rowid + "," + bodyJson["rowid"];
                                                        logger.debug("Got Team before<<<<<<<<<<<<<<<<<<<<< ", teamData[0].loginname);
                                                        if (teamData[0].loginname.length > 0 && teamData[0].loginname_rowid.length > 0) {
                                                            if (teamData[0].loginname.substring(0, 1) == ',') {
                                                                teamData[0].loginname = teamData[0].loginname.substring(1);
                                                            }

                                                            if (teamData[0].loginname_rowid.substring(0, 1) == ',') {
                                                                teamData[0].loginname_rowid = teamData[0].loginname_rowid.substring(1);
                                                            }

                                                        }
                                                        logger.debug("Got Team after <<<<<<<<<<<<<<<<<<<<< ", teamData[0].loginname);
                                                        d4dModelNew.d4dModelMastersTeams.update({
                                                            rowid: teamData[0].rowid
                                                        }, {
                                                            $set: JSON.parse(JSON.stringify(teamData[0]))
                                                        }, {
                                                            upsert: false
                                                        }, function(err, updatedTeam) {
                                                            if (err) {
                                                                logger.debug("Failed to update Team<<<<<<<<<<<<<<<< ", errorResponses.db.error);
                                                            }
                                                            logger.debug("Successfully Team updated with User.");
                                                        });

                                                    });
                                                    if (x === rowId.length - 1) {
                                                        res.send(200);
                                                        return;
                                                    }
                                                }
                                            });
                                        });

                                    } else if (req.params.id === '4') {
                                        bodyJson['appdeploy'] = JSON.parse(bodyJson['appdeploy']);
                                        var projectModel = new d4dModelNew.d4dModelMastersProjects(bodyJson);
                                        projectModel.save(function(err, data) {
                                            if (err) {
                                                logger.error('Hit Save error', err);
                                                res.send(500);
                                                return;
                                            }
                                            res.send(200);
                                            return;
                                        });
                                    } else {
                                        logger.debug("FLD>>>>>>>>>>>>> ", FLD);
                                        eval('var mastersrdb =  new d4dModelNew.' + dbtype + '({' + JSON.parse(FLD) + '})');
                                        mastersrdb.save(function(err, data) {
                                            if (err) {
                                                logger.error('Hit Save error', err);
                                                res.send(500);
                                                return;

                                            }
                                            logger.debug('New Master Saved');
                                            logger.debug(req.params.fileinputs == 'null');
                                            logger.debug('New record folderpath: % rowid %s FLD["folderpath"]:', folderpath, newrowid, folderpath);
                                            if (!folderpath) {
                                                if (FLD["folderpath"] == undefined) //folderpath issue fix
                                                    folderpath = ''
                                                else
                                                    folderpath = rowFLD["folderpath"];
                                            }
                                            //if env is saved then it should be associated with project.
                                            if (req.params.id == '3') {
                                                logger.debug('in env save>>>>>>>>>');
                                                var projId = bodyJson['projectname_rowid'].split(",");
                                                //logger.debug('orgId:', orgId);
                                                for (var proj = 0; proj < projId.length; proj++) {
                                                    d4dModelNew.d4dModelMastersProjects.find({
                                                        rowid: projId[proj],
                                                        id: "4"
                                                    }, function(err, projs_) {
                                                        if (!err) {
                                                            logger.debug('Project found for Org <<<<======++++++++++++++++++:' + projs_);
                                                            updateProjectWithEnv(projs_, bodyJson);
                                                        }
                                                    });
                                                }
                                            }
                                            //resetting the orgname to empty string when a template type file is uploaded.
                                            if (req.params.id == '17') {
                                                req.params.orgname = "undefined";
                                            }

                                            if (req.params.fileinputs != 'null')
                                                res.send(saveuploadedfile(newrowid + '__', folderpath, req));
                                            else
                                                res.send(200);

                                            return;
                                        });
                                    }
                                } else {

                                    // Update settings

                                    if (req.params.id === '4') {
                                        bodyJson['appdeploy'] = JSON.parse(bodyJson['appdeploy']);
                                        delete rowtoedit._id; //fixing the issue of 
                                        rowtoedit["appdeploy"] = bodyJson['appdeploy'];
                                        logger.debug('Rowtoedit: %s', JSON.stringify(rowtoedit));
                                        eval('d4dModelNew.' + dbtype).update({
                                            rowid: bodyJson["rowid"],
                                            "id": "4"
                                        }, {
                                            $set: rowtoedit
                                        }, {
                                            upsert: false
                                        }, function(err, saveddata) {
                                            if (err) {
                                                logger.error('Hit Save error', err);
                                                res.send(500);
                                                return;
                                            }
                                            res.send(200);
                                            return;
                                        });
                                    }
                                    if (req.params.id === "7") {
                                        d4dModelNew.d4dModelMastersUsers.find({
                                            "id": req.params.id,
                                            loginname: bodyJson["loginname"]
                                        }, function(err, anUser) {
                                            if (err) {
                                                logger.debug("Error to fetch user.");
                                                res.send(500, "Error to fetch User.");
                                                return;
                                            }
                                            logger.debug("Fetched User: ", JSON.stringify(anUser));
                                            if (anUser.length) {
                                                if (bodyJson["password"] === '') {

                                                    delete rowtoedit._id; //fixing the issue of 
                                                    if (bodyJson["orgname"] === "") {
                                                        logger.debug("Inside if for empty for update..");
                                                        rowtoedit["orgname"] = [""];
                                                        rowtoedit["orgname_rowid"] = [""];
                                                    }
                                                    rowtoedit["password"] = anUser[0].password;
                                                    logger.debug('Rowtoedit: %s', JSON.stringify(rowtoedit));
                                                    eval('d4dModelNew.' + dbtype).update({
                                                        rowid: bodyJson["rowid"],
                                                        "id": "7"
                                                    }, {
                                                        $set: rowtoedit
                                                    }, {
                                                        upsert: false
                                                    }, function(err, saveddata) {
                                                        if (err) {
                                                            logger.error('Hit Save error', err);
                                                            res.send(500);
                                                            return;
                                                        }
                                                        res.send(200);
                                                        return;
                                                    });

                                                } else if (bodyJson["password"] != anUser[0].password) {
                                                    authUtil.hashPassword(bodyJson["password"], function(err, hashedPassword) {
                                                        if (err) {
                                                            logger.error('Hit error', err);
                                                            res.send(500);
                                                            return;
                                                        }
                                                        logger.debug("hashedPassword: ", hashedPassword);
                                                        delete rowtoedit._id; //fixing the issue of 
                                                        if (bodyJson["orgname"] === "") {
                                                            logger.debug("Inside if for empty for update..");
                                                            rowtoedit["orgname"] = [""];
                                                            rowtoedit["orgname_rowid"] = [""];
                                                        }
                                                        rowtoedit["password"] = hashedPassword;
                                                        logger.debug('Rowtoedit: %s', JSON.stringify(rowtoedit));
                                                        eval('d4dModelNew.' + dbtype).update({
                                                            rowid: bodyJson["rowid"],
                                                            "id": "7"
                                                        }, {
                                                            $set: rowtoedit
                                                        }, {
                                                            upsert: false
                                                        }, function(err, saveddata) {
                                                            if (err) {
                                                                logger.error('Hit Save error', err);
                                                                res.send(500);
                                                                return;
                                                            }
                                                            res.send(200);
                                                            return;
                                                        });
                                                    });
                                                } else {
                                                    delete rowtoedit._id; //fixing the issue of 
                                                    if (bodyJson["orgname"] === "") {
                                                        logger.debug("Inside if for empty for update..");
                                                        rowtoedit["orgname"] = [""];
                                                        rowtoedit["orgname_rowid"] = [""];
                                                    }
                                                    logger.debug('Rowtoedit: %s', JSON.stringify(rowtoedit));
                                                    eval('d4dModelNew.' + dbtype).update({
                                                        rowid: bodyJson["rowid"],
                                                        "id": "7"
                                                    }, {
                                                        $set: rowtoedit
                                                    }, {
                                                        upsert: false
                                                    }, function(err, saveddata) {
                                                        if (err) {
                                                            logger.error('Hit Save error', err);
                                                            res.send(500);
                                                            return;
                                                        }
                                                        res.send(200);
                                                        return;
                                                    });
                                                }
                                            } else {
                                                res.send(404);
                                                return;
                                            }
                                        });
                                    }

                                    if (req.params.id === "3") {
                                        d4dModelNew.d4dModelMastersProjects.find({
                                            environmentname_rowid: {
                                                $regex: bodyJson['rowid']
                                            },
                                            id: "4"
                                        }, function(err, projs) {
                                            if (!err) {
                                                logger.debug('Project found for Org ======++++++++++++++++++:' + projs);
                                                dissociateProjectWithEnv(projs, bodyJson);
                                            }
                                        });
                                    }

                                    logger.debug("Rowid: %s", bodyJson["rowid"]);
                                    var currowid = bodyJson["rowid"];
                                    delete rowtoedit._id; //fixing the issue of 
                                    logger.debug('Rowtoedit: %s', JSON.stringify(rowtoedit));
                                    eval('d4dModelNew.' + dbtype).update({
                                        rowid: bodyJson["rowid"]
                                    }, {
                                        $set: rowtoedit
                                    }, {
                                        upsert: false
                                    }, function(err, saveddata) {
                                        if (err) {
                                            logger.error('Hit Save error', err);
                                            res.send(500);
                                            return;
                                        }

                                        if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                            folderpath = ''
                                        else
                                            folderpath = bodyJson["folderpath"];

                                        //if env is saved then it should be associated with project.
                                        if (req.params.id == '3') {
                                            logger.debug('in env update>>>>>>>>>>>>');
                                            var projId = bodyJson['projectname_rowid'].split(",");
                                            //logger.debug('orgId:', orgId);
                                            for (var proj = 0; proj < projId.length; proj++) {
                                                d4dModelNew.d4dModelMastersProjects.find({
                                                    rowid: projId[proj],
                                                    id: "4"
                                                }, function(err, projs) {
                                                    if (!err) {
                                                        logger.debug('Project found for Org ======++++++++++++++++++:' + projs);
                                                        updateProjectWithAllEnv(projs, bodyJson);
                                                    }
                                                });
                                            }
                                        }
                                        if (req.params.id === '21') {
                                            var projectName = bodyJson["projectname"];
                                            logger.debug("projectName::::::::::::: ", projectName);
                                            d4dModelNew.d4dModelMastersTeams.update({
                                                rowid: bodyJson["rowid"],
                                                id: "21"
                                            }, {
                                                $set: {
                                                    projectname: projectName
                                                }
                                            }, {
                                                upsert: false
                                            }, function(err, updateCount) {
                                                if (err) {
                                                    logger.debug("Team update Fail..", err);
                                                }
                                                logger.debug("++++++++++++++++++++ ", updateCount);
                                            });
                                        }

                                        if (req.params.id === '1') {
                                            masterUtil.updateTeam(bodyJson['rowid'], function(err, aBody) {
                                                if (err) {
                                                    logger.debug("Error on update Org.".err);
                                                }
                                                logger.debug("Return body: ", JSON.stringify(aBody));
                                            });
                                        }

                                        logger.debug('Master Data Updated: %s', saveddata);
                                        logger.debug('folderpath: %s rowid %s', folderpath, currowid);
                                        //resetting the orgname to empty string when a template type file is uploaded.
                                        if (req.params.id == '17') {
                                            req.params.orgname = "undefined";
                                        }
                                        if (req.params.fileinputs != 'null')
                                            res.send(saveuploadedfile(currowid + '__', folderpath, req));
                                        else
                                            res.send(200);
                                        logger.debug("Exit post() for /d4dMasters/savemasterjsonrownew/%s/%s/%s", req.params.id, req.params.fileinputs, req.params.orgname);
                                        return;
                                    });
                                }
                                //dMasterJson = rowtoedit;

                                //console.log(JSON.stringify(d4dMasterJson));



                            }); //end findone
                            //console.log('state of rowtoedit ' + (rowtoedit != null)); //testing if the rowtoedit has a value

                        }
                    }); //end getdbmodelfromid
                } // if
            }); // getSingleUser
        }); //end of haspermission

    });

    function autoCreateTeams(bodyJson) {
        for (var x = 0; x < 4; x++) {
            var teamName;
            var descriptions;
            if (x === 0) {
                teamName = bodyJson["orgname"] + "_Admins";
                descriptions = "Team For " + teamName;
            } else if (x === 1) {
                teamName = bodyJson["orgname"] + "_DEV";
                descriptions = "Team For " + teamName;
            } else if (x === 2) {
                teamName = bodyJson["orgname"] + "_QA";
                descriptions = "Team For " + teamName;
            } else {
                teamName = bodyJson["orgname"] + "_DevOps";
                descriptions = "Team For " + teamName;
            }

            logger.debug("orgname_rowid>>>>>>>>>>>>>>>> ", bodyJson["rowid"]);

            var teamData = {
                "teamname": teamName,
                "description": descriptions,
                "orgname": bodyJson["orgname"],
                "orgname_rowid": bodyJson["rowid"],
                "rowid": uuid.v4(),
                "id": "21"
            };
            logger.debug("teamData>>>>>>>>>>>>>>>>>>>>>>>> ", teamData);
            var teamModel = new d4dModelNew.d4dModelMastersTeams(teamData);
            teamModel.save(function(err, aTeam) {
                if (err) {
                    //res.send(500,"Failed to save Team.");
                    logger.debug("Failed to save Team.");
                }
                logger.debug("Auto created Team:>>>>>>>> ", JSON.stringify(aTeam));
            });

        }
    }

    app.post('/d4dMasters/testingupload/:suffix/:fileinputs', function(req, res) {
        logger.debug("Enter post() for /d4dMasters/testingupload/%s/%s", req.params.suffix, req.params.fileinputs);
        logger.debug("req body: %s", req.body);
        var fi;
        if (req.params.fileinputs.indexOf(',') > 0)
            fi = req.params.fileinputs.split(',');
        else {
            fi = new Array();
            fi.push(req.params.fileinputs);
        }


        var filesNames = Object.keys(req.files);
        var count = filesNames.length;
        logger.debug('in %s', count);
        filesNames.forEach(function(item) {
            logger.debug(item);
        });


        settingsController.getChefSettings(function(settings) {
            var chefRepoPath = settings.chefReposLocation;
            fs.mkdirParent(chefRepoPath + req.params.orgname); //if path is not present create it.
            for (var i = 0; i < fi.length; i++) {
                var controlName = fi[i];
                var fil = eval('req.files.' + fi[i]);
                if (typeof fil != 'undefined') {
                    logger.debug('this is where file gets saved  : %s %s', chefRepoPath, fil.name);
                    fileIo.readFile(fil.path, function(err, data) {
                        //var getDirName = require("path").dirname;
                        fileIo.writeFile(chefRepoPath + req.params.orgname + '/' + controlName + '__' + fil.name, data, null, function(err) {
                            logger.error("Hit error: ", err);
                            count--;
                            if (count === 0) { // all files uploaded
                                res.send("ok");
                            }
                        });
                        /*mkdirp(getDirName(chefRepoPath + 'logo' ),function(err){
                            if(err) console.log(err);
                            else{

                                fileIo.writeFile(chefRepoPath + 'logo/' + fil.name, data, null, function(err) {
                                    console.log(err);
                                    count--;
                                    if (count === 0) { // all files uploaded
                                        res.send("ok");
                                    }
                                });
                            }
                        }); */
                    });

                }
            }
        });
        res.send(200);
        logger.debug("Exit post() for /d4dMasters/testingupload/%s/%s", req.params.suffix, req.params.fileinputs);
    });





    app.post('/d4dMasters/savemasterjson/:id', function(req, res) {
        //Finding the Master Json if present
        logger.debug("Enter post() for /d4dMasters/savemasterjson/%s", req.params.id);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (!d4dMasterJson) {


                var d4dmj = new d4dModel({
                    id: '1',
                    masterjson: req.body
                });
                d4dmj.save(function(err, d4dmj) {
                    if (err) {
                        logger.error("Hit and error:", err)
                        res.send(500);
                    };
                    logger.debug('saved');
                });
                res.send(200);
            } else {

                d4dMasterJson.masterjson = req.body;

                d4dMasterJson.save(function(err, d4dMasterJson) {
                    if (err) {
                        logger.error("Hit and error:", err)
                    }
                    logger.debug('updated');
                });
                res.send(200);
            }
            logger.debug("Exit post() for /d4dMasters/savemasterjson/%s", req.params.id);
        });
        //mongoose.disconnect();
    });

    app.get('/createbg/:orgname/:bgname', function(req, res) {
        logger.debug("Enter get() for /createbg/%s/%s", req.params.orgname, req.params.bgname);
        // var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
        var bgfield = "{\"field\":[{\"values\":{\"value\":\"" + req.params.bgname + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"name\":\"costcode\"}] }";
        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        logger.debug(JSON.stringify(bgfield));
        db.once('open', function callback() {

            logger.debug('in once');
        });
        logger.debug('received request %s', req.params.bgname);
        d4dModel.findOne({
            id: '2'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'productgroupname') {
                            if (itm.field[j]["values"].value == req.params.bgname) {
                                logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                        // console.log();
                    }
                });
                if (hasOrg == false) {
                    //Creating org
                    logger.debug('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(bgfield));
                    d4dModel.update({
                        "id": "2"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
                        upsert: false
                    }, function(err, data) {
                        if (err) {
                            callback(err, null);
                            res.send(500);
                            return;
                        }
                        res.send(200);
                        //callback(null, data);
                    });
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                logger.debug("none found");
            }
            logger.debug("Exit get() for /createbg/%s/%s", req.params.orgname, req.params.bgname);

        });
    });


    app.get('/createproj/:orgname/:envname/:prodgroup/:projname', function(req, res) {
        logger.debug("Enter get() for /createproj/%s/%s/%s/%s", req.params.orgname, req.params.envname, req.params.prodgroup, req.params.projname);
        var projField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.projname + "\"},\"name\":\"projectname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"" + req.params.prodgroup + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.envname + "\"},\"name\":\"environmentname\"},{\"values\":{\"value\":[\"Code 1\",\"Code 2\"]},\"name\":\"costcode\"}] }";

        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        logger.debug(JSON.stringify(projField));
        db.once('open', function callback() {

            logger.debug('in once');
        });
        logger.debug('received request %s', req.params.orgname);
        d4dModel.findOne({
            id: '4'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'projectname') {
                            //console.log("found:" + itm.field[j]["values"].value);
                            if (itm.field[j]["values"].value == req.params.projname) {
                                logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                        // console.log();
                    }
                });
                if (hasOrg == false) {
                    //Creating org
                    logger.debug('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(projField));
                    d4dModel.update({
                        "id": "4"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
                        upsert: false
                    }, function(err, data) {
                        if (err) {
                            callback(err, null);
                            res.send(500);
                            return;
                        }
                        res.send(200);
                        //callback(null, data);
                    });
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                logger.debug("none found");
            }
            logger.debug("Exit get() for /createproj/%s/%s/%s/%s", req.params.orgname, req.params.envname, req.params.prodgroup, req.params.projname);

        });
    });


    app.get('/createenv/:orgname/:envname', function(req, res) {
        logger.debug("Enter get() for /createenv/%s/%s", req.params.orgname, req.params.envname);
        var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        logger.debug(JSON.stringify(envField));
        db.once('open', function callback() {

            logger.debug('in once');
        });
        logger.debug('received request %s', req.params.orgname);
        d4dModel.findOne({
            id: '3'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error:", err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'environmentname') {
                            //console.log("found:" + itm.field[j]["values"].value);
                            if (itm.field[j]["values"].value == req.params.envname) {
                                logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }
                    }


                });
                if (hasOrg == false) {
                    //Creating org
                    logger.debug('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(envField));


                    d4dModel.update({
                        "id": "3"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
                        upsert: false
                    }, function(err, data) {
                        if (err) {
                            callback(err, null);
                            res.send(500);
                            return;
                        }
                        res.send(200);
                        //callback(null, data);
                    });
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                logger.debug("none found");
            }
            logger.debug("Exit get() for /createenv/%s/%s", req.params.orgname, req.params.envname);

        });
    });


    app.get('/createorg/:orgname', function(req, res) {
        logger.debug("Enter get() for /createorg/%s", req.params.orgname);
        var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        logger.debug(JSON.stringify(orgField));
        db.once('open', function callback() {

            logger.debug('in once');
        });
        logger.debug('received request %s', req.params.orgname);
        d4dModel.findOne({
            id: '1'
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.error("Hit and error: ", err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found %s", itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'orgname') {
                            //console.log("found:" + itm.field[j]["values"].value);
                            if (itm.field[j]["values"].value == req.params.orgname) {
                                logger.debug("found: %s -- %s", i, itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                        // console.log();
                    }

                    /*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    console.log(" Innner: " + JSON.stringify(itmjson));
                });*/

                });
                if (hasOrg == false) {
                    //Creating org
                    logger.debug('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(orgField));
                    d4dModel.update({
                        "id": "1"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
                        upsert: false
                    }, function(err, data) {
                        if (err) {
                            callback(err, null);
                            res.send(500);
                            return;
                        }
                        res.send(200);
                        //callback(null, data);
                    });

                    /*d4dMasterJson.update(function (err, d4dMasterJson) {
                        if (err) {
                            console.log("Hit and error:" + err)
                        }
                        console.log('updated' + JSON.stringify(d4dMasterJson));
                    });*/
                    //res.send(200);
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                logger.debug("none found");
            }
            logger.debug("Exit get() for /createorg/%s", req.params.orgname);

        });
    });

    app.get('/d4dMasters/:chefserver/cookbooks', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/%s/cookbooks", req.params.chefserver);
        configmgmtDao.getChefServerDetailsByChefServer(req.params.chefserver, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata %s", chefDetails);

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
                    logger.debug("Exit get() for /d4dMasters/%s/cookbooks", req.params.chefserver);
                }
            });

        });

    });

    app.post('/d4dMasters/test', function(req, res) {
        var bodyJson = JSON.parse(JSON.stringify(req.body));
        logger.debug('rcvd : ' + bodyJson['teamids']);
        configmgmtDao.getProjectsForTeams(bodyJson['teamids'], function(err, data) {
            if (!err) {
                res.send(data);
            }
        });
    });

    app.get('/d4dMasters/:chefserver/roles', function(req, res) {
        logger.debug("Enter get() for /d4dMasters/%s/roles", req.params.chefserver);
        configmgmtDao.getChefServerDetailsByChefServer(req.params.chefserver, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            logger.debug("chefdata %s", chefDetails);
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
                    logger.debug("Exit get() for /d4dMasters/%s/roles", req.params.chefserver);
                }
            });

        });

    });

    app.get('/d4dMasters/loggedInUser', function(req, res) {
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.send(500, "Failed to fetch User.");
            }
            if (!anUser) {
                res.send(500, "Invalid User.");
            }
            if (anUser.orgname_rowid[0] === "") {
                res.send({
                    "isSuperAdmin": true
                });
                return;
            } else {
                res.send({
                    "isSuperAdmin": false
                });
                return;
            }
        });
    });

    app.get('/d4dMasters/orgs/all/users/7', function(req, res) {
        logger.debug("hhhhhhh");
        masterUtil.getUsersForAllOrg(function(err, users) {
            if (err) {
                res.send(500, "Failed to fetch User.");
            }
            res.send(users);
            return;
        });
    });

    app.get('/d4dMasters/cftTemplate', function(req, res) {
        var templateFile = req.query.templateFile;
        var settings = appConfig.chef;
        var chefRepoPath = settings.chefReposLocation;
        fs.readFile(chefRepoPath + 'catalyst_files/' + templateFile, function(err, data) {
            if (err) {
                logger.error("Unable to read template file " + templateFile, err);
                res.send(500, {
                    message: "Unable to read file"
                });
                return;
            }
            res.send(200, data);
        });

    });
    app.get('/d4dMasters/configmanagement', function(req, res) {
        masterUtil.getAllActiveOrg(function(err, orgList) {
            logger.debug("got org list ==>", JSON.stringify(orgList));
            if (err) {
                res.send(500, 'Not able to fetch Orgs.');
                return;
            }
            masterUtil.getAllCongifMgmts(orgList, function(err, list) {
                if (err) {
                    logger.debug("Failed to fetch all configmanagement", err);
                    res.send(500, "Failed to fetch all configmanagement");
                    return;
                }
                res.send(list);
                return;
            });
        });
    });

    app.get('/d4dMasters/organization/:orgId/configmanagement/list', function(req, res) {
        masterUtil.getAllCongifMgmtsForOrg(req.params.orgId, function(err, list) {
            if (err) {
                logger.debug("Failed to fetch all configmanagement", err);
                res.send(500, "Failed to fetch all configmanagement");
                return;
            }
            res.send(list);
            return;
        });
    });

    app.get('/d4dMasters/configmanagement/:anId', function(req, res) {
        if (!req.params.anId) {
            res.send(400, {
                message: "Invalid Config Management Id"
            });
            return;
        }
        masterUtil.getCongifMgmtsById(req.params.anId, function(err, data) {
            if (err) {
                logger.debug("Failed to fetch all configmanagement", err);
                res.send(500, "Failed to fetch all configmanagement");
                return;
            }
            if (!data) {
                res.send(404, "No ConfigManagement Found.");
                return;
            }
            res.send(data);
            return;
        });
    });

    app.get('/d4dMasters/env/:anId', function(req, res) {
        logger.debug("Entered to env name...");
        masterUtil.getEnvironmentName(req.params.anId, function(err, data) {
            if (err) {
                logger.debug("Failed to fetch  Environment", err);
                res.send(500, "Failed to fetch  Environment");
                return;
            }
            if (!data) {
                res.send(404, "No Environment Found.");
                return;
            }
            res.send(data);
            return;
        });
    });

    app.get('/d4dMasters/project/:anId', function(req, res) {
        logger.debug("Entered to Project name...");
        masterUtil.getParticularProject(req.params.anId, function(err, data) {
            if (err) {
                logger.debug("Failed to fetch  Environment", err);
                res.send(500, "Failed to fetch  Environment");
                return;
            }
            if (!data) {
                res.send(404, "No Environment Found.");
                return;
            }
            res.send(data);
            return;
        });
    });

    app.get('/d4dMasters/projectname/:anId', function(req, res) {
        logger.debug("Entered to Project name...");
        masterUtil.getProjectName(req.params.anId, function(err, data) {
            if (err) {
                logger.debug("Failed to fetch  Environment", err);
                res.send(500, "Failed to fetch  Environment");
                return;
            }
            if (!data) {
                res.send(404, "No Environment Found.");
                return;
            }
            res.send(data);
            return;
        });
    });

    app.post('/d4dMasters/project/:anId/appName/update', function(req, res) {
        logger.debug("Updating appName in Project...");

                /*db.d4dmastersnew.update({
            "rowid": "95213423-50d1-4dce-b6f4-0d51c4460998"
        }, {
            $set: {
                "appdeploy": [{
                    applicationname: "catalyst",
                    "appdescription": "Test app deploy"
                }]
            }
        })
        */
        d4dModelNew.d4dModelMastersProjects.update({
            rowid: req.params.anId,
            id: '4'
        }, {
            $set: {
                "appdeploy": [{
                    applicationname: req.body.appName,
                        appdescription: req.body.description
                }]
            }
        }, {
            upsert: false
        }, function(err, data) {
            logger.debug("Update Count+++++++++++++++ ", data);
            if (err) {
                logger.debug('Err while updating d4dModelMastersProjects' + err);
                return;
            }
            logger.debug('Updated project ' + req.params.anId + ' with App Name : ' + req.body.appName);
            return;
        });
    });
}
