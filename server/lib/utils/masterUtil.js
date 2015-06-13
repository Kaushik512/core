/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Util class which contains Settings related all business logics.

var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');
var ObjectId = require('mongoose').Types.ObjectId;
var permissionsetDao = require('../../model/dao/permissionsetsdao');
var d4dModel = require('../../model/d4dmasters/d4dmastersmodel.js');
var configmgmtDao = require('../../model/d4dmasters/configmgmt.js');

var MasterUtil = function(){
    // Return All Orgs specific to User
    this.getOrgs = function(loggedInUser, callback) {
        var orgList = [];
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: loggedInUser
        }, function(err, users) {
            if (err) {
                logger.debug("Unable to fetch User.");
                callback(err, null);
            }
            logger.debug("Able to get User: ", JSON.stringify(users));
            if (users) {
                var count = 0;
                var usrCount = 0;
                var errOccured = false;
                for (var x = 0; x < users.length; x++) {
                    (function(countUser) {
                        logger.debug("x+++++++++++++++++++++++ ", countUser);
                        if (users[countUser].id === '7') {
                            usrCount++;
                            var orgIds = users[countUser].orgname_rowid;
                            logger.debug("orgIds: ", typeof orgIds[0]);
                            if (typeof orgIds[0] === 'undefined') {
                                d4dModelNew.d4dModelMastersOrg.find({
                                    id: "1",
                                    active: true
                                }, function(err, orgs) {
                                    count++;
                                    if (err) {
                                        logger.debug("Unable to fetch Org.", err);
                                        errOccured = true;
                                        return;
                                    }
                                    if (orgs) {
                                        for (var y = 0; y < orgs.length; y++) {
                                            (function(countOrg) {
                                                logger.debug("y++++++++++++++++ ", countOrg);
                                                if (orgs[countOrg].id === '1') {
                                                    logger.debug("Able to get Org.", JSON.stringify(orgs[countOrg]));
                                                    orgList.push(orgs[countOrg]);
                                                }
                                            })(y);
                                        }

                                    }
                                    if (count === usrCount) {
                                        logger.debug("Returned Orgs: ", JSON.stringify(orgList));
                                        callback(errOccured, orgList);
                                    }


                                });
                            } else {

                                logger.debug("Org orgIds for query: ", orgIds);
                                d4dModelNew.d4dModelMastersOrg.find({
                                    rowid: {
                                        $in: orgIds
                                    },
                                    active: true
                                }, function(err, orgs) {
                                    count++;
                                    if (err) {
                                        logger.debug("Unable to fetch Org.", err);
                                        errOccured = true;
                                        return;
                                    }
                                    if (orgs) {
                                        for (var y = 0; y < orgs.length; y++) {
                                            (function(countOrg) {
                                                if (orgs[countOrg].id === '1') {
                                                    logger.debug("Able to get Org.", JSON.stringify(orgs[countOrg]));
                                                    orgList.push(orgs[countOrg]);
                                                }
                                            })(y);
                                        }
                                    }
                                    logger.debug('count ==>', count, "user length = >", usrCount);
                                    if (count === usrCount) {
                                        logger.debug("Returned Orgs: ", JSON.stringify(orgList));
                                        callback(errOccured, orgList);
                                    }
                                });
                            }
                        }
                    })(x);
                }
            } else {
                callback(null, orgList);
            }
        });
    }

    // Return all BusinessGroups specific to User
    this.getBusinessGroups = function(orgList, callback) {

        var productGroupList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersProductGroup.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, bgs) {
            if (err) {
                callback(err, null);
            }
            if (bgs) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < bgs.length; i++) {
                        (function(bgCount) {
                            if (bgs[bgCount].id === '2') {
                                logger.debug("Returned BG: ", JSON.stringify(bgs[bgCount]));
                                names = configmgmtDao.convertRowIDToValue(bgs[bgCount].orgname_rowid, rowidlist)
                                logger.debug("Get bg: ++++++++++++++++++++____________", names);
                                bgs[bgCount].orgname = names;
                                productGroupList.push(bgs[bgCount]);
                            }
                        })(i);
                    }
                    logger.debug("productGroupList: ", JSON.stringify(productGroupList));
                    callback(null, productGroupList);
                    return;
                });
            } else {
                callback(null, productGroupList);
                return;
            }
        });
    }

    // Return all Environments specific to User
    this.getEnvironments = function(orgList, callback) {
        var envList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersEnvironments.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, envs) {
            if (err) {
                callback(err, null);
            }
            if (envs) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < envs.length; i++) {
                        (function(envCount) {
                            if (envs[envCount].id === '3') {
                                names = configmgmtDao.convertRowIDToValue(envs[envCount].orgname_rowid, rowidlist)
                                envs[envCount].orgname = names;
                                names = configmgmtDao.convertRowIDToValue(envs[envCount].configname_rowid, rowidlist)
                                envs[envCount].configname = names;
                                envList.push(envs[envCount]);
                            }
                        })(i);
                    }
                    logger.debug("Returned ENVs: ", JSON.stringify(envList));
                    callback(null, envList);
                    return;
                });
            } else {
                callback(null, envList);
                return;
            }
        });
    }

    // Return all Projects specific to User
    this.getProjects = function(orgList, callback) {
        var projectList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersProjects.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, projects) {
            if (err) {
                callback(err, null);
            }
            if (projects) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    var allEnvs ='';
                    for (var i = 0; i < projects.length; i++) {
                        (function(projectCount) {
                            if (projects[projectCount].id === '4') {
                                names = configmgmtDao.convertRowIDToValue(projects[projectCount].orgname_rowid, rowidlist);
                                bgnames = configmgmtDao.convertRowIDToValue(projects[projectCount].productgroupname_rowid, rowidlist);
                                logger.debug("getProjects===================== ",bgnames);
                                projects[projectCount].orgname = names;
                                projects[projectCount].productgroupname = bgnames;
                                //projectList.push(projects[projectCount]);
                                var envs = projects[projectCount].environmentname_rowid.split(",");
                                for(var e = 0;e< envs.length;e++){
                                    logger.debug("envs:::::::::::::: ",projects[projectCount].environmentname);
                                    envnames = configmgmtDao.convertRowIDToValue(envs[e], rowidlist);
                                    allEnvs =allEnvs+","+envnames;
                                }
                                allEnvs = allEnvs.substring(1);
                                projects[projectCount].environmentname = allEnvs;
                                projectList.push(projects[projectCount]);
                            }
                        })(i);
                    }
                    logger.debug("Returned Projects: ", JSON.stringify(projectList));
                    callback(null, projectList);
                    return;
                });
            } else {
                callback(null, projectList);
                return;
            }
        });
    }

    // Return all ConfigManagement specific to User
    this.getCongifMgmts = function(orgList, callback) {
        var congifMgmtList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersConfigManagement.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, configMgmt) {
            if (configMgmt) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < configMgmt.length; i++) {
                        if (configMgmt[i].id === '10') {
                            names = configmgmtDao.convertRowIDToValue(configMgmt[i].orgname_rowid, rowidlist)
                            configMgmt[i].orgname = names;
                            congifMgmtList.push(configMgmt[i]);
                        }
                    }
                    callback(null, congifMgmtList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }
        });
    }

    // Return all Dockers
    this.getDockers = function(orgList, callback) {
        var dockerList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersDockerConfig.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, dockers) {
            if (dockers) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < dockers.length; i++) {
                        if (dockers[i].id === '18') {
                            names = configmgmtDao.convertRowIDToValue(dockers[i].orgname_rowid, rowidlist)
                            dockers[i].orgname = names;
                            dockerList.push(dockers[i]);
                        }
                    }
                    callback(null, dockerList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }

    // Return all Templates
    this.getTemplates = function(orgList, callback) {
        var templateList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersTemplatesList.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, templates) {
            if (err) {
                callback(err, null);
            }
            if (templates) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < templates.length; i++) {
                        if (templates[i].id === '17') {
                            names = configmgmtDao.convertRowIDToValue(templates[i].orgname_rowid, rowidlist)
                            templates[i].orgname = names;
                            templateList.push(templates[i]);
                        }
                    }
                    callback(null, templateList);
                    return;
                });
            } else {
                callback(null, templateList);
                return;
            }

        });
    }

    // Return all TemplateTypes
    this.getTemplateTypes = function(orgList, callback) {
        logger.debug("getTemplateTypes called. ", JSON.stringify(orgList));
        var templateTypeList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, templateTypes) {
            if (err) {
                callback(err, null);
            }
            if (templateTypes) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < templateTypes.length; i++) {
                        if (templateTypes[i].id === '16') {
                            names = configmgmtDao.convertRowIDToValue(templateTypes[i].orgname_rowid, rowidlist)
                            templateTypes[i].orgname = names;
                            templateTypeList.push(templateTypes[i]);
                        }
                    }
                    callback(null, templateTypeList);
                    return;
                });
            } else {
                callback(null, templateTypeList);
                return;
            }

        });
    }

    // Return all ServiceCommands
    this.getServiceCommands = function(orgList, callback) {
        var serviceCommandList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersServicecommands.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, serviceCommands) {
            if (serviceCommands) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < serviceCommands.length; i++) {
                        if (serviceCommands[i].id === '19') {
                            names = configmgmtDao.convertRowIDToValue(serviceCommands[i].orgname_rowid, rowidlist)
                            serviceCommands[i].orgname = names;
                            serviceCommandList.push(serviceCommands[i]);
                        }
                    }
                    callback(null, serviceCommandList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }

    // Return all Jenkins
    this.getJenkins = function(orgList, callback) {
        var jenkinList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelJenkinsConfig.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, jenkins) {
            if (jenkins) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < jenkins.length; i++) {
                        if (jenkins[i].id === '20') {
                            names = configmgmtDao.convertRowIDToValue(jenkins[i].orgname_rowid, rowidlist)
                            jenkins[i].orgname = names;
                            jenkinList.push(jenkins[i]);
                        }
                    }
                    callback(null, jenkinList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }

    // Return All Orgs specific to User
    this.getActiveOrgs = function(loggedInUser, callback) {
        var orgList = [];
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: loggedInUser
        }, function(err, users) {
            if (err) {
                logger.debug("Unable to fetch User.");
                callback(err, null);
            }
            logger.debug("Able to get User: ", JSON.stringify(users));
            if (users) {
                var count = 0;
                var usrCount = 0;
                var errOccured = false;
                for (var x = 0; x < users.length; x++) {
                    (function(countUser) {
                        logger.debug("x+++++++++++++++++++++++ ", countUser);
                        if (users[countUser].id === '7') {
                            usrCount++;
                            var orgIds = users[countUser].orgname_rowid;
                            logger.debug("orgIds: ", typeof orgIds[0]);
                            if (typeof orgIds[0] === 'undefined') {
                                d4dModelNew.d4dModelMastersOrg.find({
                                    id: "1",
                                    active: true
                                }, function(err, orgs) {
                                    count++;
                                    if (err) {
                                        logger.debug("Unable to fetch Org.", err);
                                        errOccured = true;
                                        return;
                                    }
                                    if (orgs) {
                                        for (var y = 0; y < orgs.length; y++) {
                                            (function(countOrg) {
                                                logger.debug("y++++++++++++++++ ", countOrg);
                                                if (orgs[countOrg].id === '1') {
                                                    logger.debug("Able to get Org.", JSON.stringify(orgs[countOrg]));
                                                    orgList.push(orgs[countOrg]);
                                                }
                                            })(y);
                                        }

                                    }
                                    if (count === usrCount) {
                                        logger.debug("Returned Orgs: ", JSON.stringify(orgList));
                                        callback(errOccured, orgList);
                                    }


                                });
                            } else {

                                logger.debug("Org orgIds for query: ", orgIds);
                                d4dModelNew.d4dModelMastersOrg.find({
                                    rowid: {
                                        $in: orgIds
                                    },
                                    active: true
                                }, function(err, orgs) {
                                    count++;
                                    if (err) {
                                        logger.debug("Unable to fetch Org.", err);
                                        errOccured = true;
                                        return;
                                    }
                                    if (orgs) {
                                        for (var y = 0; y < orgs.length; y++) {
                                            (function(countOrg) {
                                                if (orgs[countOrg].id === '1') {
                                                    logger.debug("Able to get Org.", JSON.stringify(orgs[countOrg]));
                                                    orgList.push(orgs[countOrg]);
                                                }
                                            })(y);
                                        }
                                    }
                                    logger.debug('count ==>', count, "user length = >", usrCount);
                                    if (count === usrCount) {
                                        logger.debug("Returned Orgs: ", JSON.stringify(orgList));
                                        callback(errOccured, orgList);
                                    }
                                });
                            }
                        }
                    })(x);
                }
            } else {
                callback(null, orgList);
            }
        });
    }

    this.getAllActiveOrg = function(callback) {
        var orgList = [];
        d4dModelNew.d4dModelMastersOrg.find({
            id: "1",
            active: true
        }, function(err, orgs) {
            if (err) {
                callback(err, null);
            }
            if (orgs) {
                for (var j1 = 0; j1 < orgs.length; j1++) {
                    if (orgs[j1].id === '1') {
                        orgList.push(orgs[j1]);
                    }
                }
                callback(null, orgList);
            } else {
                callback(null, orgList);
            }
        });
    }

    this.getUserRoles = function(callback) {
        var userRoleList = [];
        d4dModelNew.d4dModelMastersUserroles.find({
            id: "6"
        }, function(err, userRoles) {
            if (err) {
                callback(err, null);
            }
            if (userRoles) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var j1 = 0; j1 < userRoles.length; j1++) {
                        if (userRoles[j1].id === '6') {
                            names = configmgmtDao.convertRowIDToValue(userRoles[j1].orgname_rowid, rowidlist)
                            userRoles[j1].orgname = names;
                            userRoleList.push(userRoles[j1]);
                        }
                    }
                    callback(null, userRoleList);
                    return;
                });
            } else {
                callback(null, userRoleList);
            }

        });
    }

    // Return all Users whose are associated to loggedIn User
    this.getUsers = function(loggedInUser, callback) {
        var userList = [];
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: loggedInUser
        }, function(err, users) {
            if (users) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].id === '7') {
                            names = configmgmtDao.convertRowIDToValue(users[i].orgname_rowid, rowidlist)
                            users[i].orgname = names;
                            userList.push(users[i]);
                        }
                    }
                    callback(null, userList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }

    // Return all Users whose are associated to loggedIn User
    this.getUsersForOrg = function(orgList, callback) {
        var userList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersUsers.find({
            orgname_rowid: rowIds
        }, function(err, users) {
            if (users) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].id === '7') {
                            names = configmgmtDao.convertRowIDToValue(users[i].orgname_rowid, rowidlist)
                            users[i].orgname = names;
                            userList.push(users[i]);
                        }
                    }
                    callback(null, userList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }

    // Return all Users whose are associated to loggedIn User
    this.getUsersForOrgOrAll = function(orgList, callback) {
        var userList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersUsers.find({
            $or: [{
                orgname_rowid: {
                    $in: rowIds
                }
            }, {
                orgname_rowid: [""]
            }]
        }, function(err, users) {
            if (users) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].id === '7') {
                            names = configmgmtDao.convertRowIDToValue(users[i].orgname_rowid, rowidlist)
                            users[i].orgname = names;
                            userList.push(users[i]);
                        }
                    }
                    callback(null, userList);
                    return;
                });
            } else {
                callback(err, null);
                return;
            }

        });
    }


    this.getTeams = function(orgList, callback) {
        var teamList = [];
        var rowIds = [];
        for (var x = 0; x < orgList.length; x++) {
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ", rowIds);
        d4dModelNew.d4dModelMastersTeams.find({
            orgname_rowid: {
                $in: rowIds
            }
        }, function(err, teams) {
            if (err) {
                callback(err, null);
            }
            logger.debug("Able to fetch Team: ", JSON.stringify(teams));
            if (teams) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < teams.length; i++) {
                        if (teams[i].id === '21') {
                            names = configmgmtDao.convertRowIDToValue(teams[i].orgname_rowid, rowidlist)
                            teams[i].orgname = names;
                            projectnames = configmgmtDao.convertRowIDToValue(teams[i].projectname_rowid, rowidlist)
                            teams[i].projectname = projectnames;
                            teamList.push(teams[i]);
                        }
                    }
                    callback(null, teamList);
                    return;
                });
            } else {
                callback(null, teamList);
                return;
            }
        });
    }

    this.getOrgById = function(orgId, callback) {
        var orgList = [];
        logger.debug("Incomming orgid: ", orgId);
        d4dModelNew.d4dModelMastersOrg.find({
            _id: new ObjectId(orgId)
        }, function(err, orgs) {
            if (orgs) {
                for (var i = 0; i < orgs.length; i++) {
                    if (orgs[i].id === '1') {
                        orgList.push(orgs[i]);
                    }
                }
                callback(null, orgList);
            } else {
                callback(err, null);
            }
        });
    }

    // Now not in use
    getOrgsByRowIds = function(orgIds, callback) {
        var orgList = [];
        logger.debug("Incomming orgid: ", orgIds);
        d4dModelNew.d4dModelMastersOrg.find({
            rowid: {
                $in: orgIds
            }
        }, function(err, orgs) {
            if (orgs) {
                for (var i = 0; i < orgs.length; i++) {
                    if (orgs[i].id === '1') {
                        orgList.push(orgs[i]);
                    }
                }
                callback(null, orgList);
            } else {
                callback(err, null);
            }
        });
    }

    // Return only loggedIn User.
    this.getLoggedInUser = function(loggedInUser, callback) {
        var anUser;
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: loggedInUser
        }, function(err, users) {
            if (users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id === '7') {
                        anUser = users[i];
                    }
                }
                callback(null, anUser);
            } else {
                callback(err, null);
            }

        });
    }

    // Return all settings for User.
    this.getAllSettingsForUser = function(loggedInUser, callback) {
        var userid;
        var teams = [];
        var orgs = [];
        var projects = [];
        var bunits = [];
        var returnObj = {};
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: loggedInUser
        }, function(err, users) {
            if (users) {
                for (var x = 0; x < users.length; x++) {
                    (function(usr) {
                        if (users[usr].id === '7') {
                            logger.debug("Got User");
                            returnObj = {
                                userid: users[usr].rowid,
                                teams: [],
                                orgs: [],
                                projects: [],
                                bunits: []
                            };
                            d4dModelNew.d4dModelMastersTeams.find({
                                orgname_rowid: {
                                    $in: users[usr].orgname_rowid
                                }
                            }, function(err, team) {
                                logger.debug("Available team: ", JSON.stringify(team));
                                if (team) {
                                    for (var tm = 0; tm < team.length; tm++) {
                                        if (team[tm].id === '21') {
                                            logger.debug("Inside team : ", team[tm].rowid);
                                            teams.push(team[tm].rowid);
                                        }
                                    }
                                }
                                logger.debug("Team array: ", JSON.stringify(teams));
                                returnObj.teams = teams;
                                d4dModelNew.d4dModelMastersOrg.find({
                                    rowid: {
                                        $in: users[usr].orgname_rowid
                                    },
                                    active: true
                                }, function(err, org) {
                                    if (err) {
                                        callback(err, null);
                                    }
                                    if (org) {
                                        logger.debug("Available Org: ", JSON.stringify(org));
                                        for (var x = 0; x < org.length; x++) {
                                            if (org[x].id === '1') {
                                                orgs.push(org[x].rowid);
                                                logger.debug("Orgs list rowid: ", org[x].rowid);
                                            }
                                        }
                                        returnObj.orgs = orgs;
                                    }
                                    d4dModelNew.d4dModelMastersProjects.find({
                                        orgname_rowid: {
                                            $in: users[usr].orgname_rowid
                                        }
                                    }, function(err, project) {
                                        if (err) {
                                            callback(err, null);
                                        }
                                        if (project) {
                                            logger.debug("Available project:>>>>> ", JSON.stringify(project));
                                            for (var x1 = 0; x1 < project.length; x1++) {
                                                if (project[x1].id === '4') {
                                                    projects.push(project[x1].rowid);
                                                    logger.debug("projectList:>>> ", project[x1].rowid);
                                                }
                                            }
                                            returnObj.projects = projects;
                                        }
                                        d4dModelNew.d4dModelMastersProductGroup.find({
                                            orgname_rowid: {
                                                $in: users[usr].orgname_rowid
                                            }
                                        }, function(err, bg) {
                                            if (err) {
                                                callback(err, null);
                                            }
                                            if (bg) {
                                                for (var x2 = 0; x2 < bg.length; x2++) {
                                                    if (bg[x2].id === '2') {
                                                        bunits.push(bg[x2].rowid);
                                                    }
                                                }
                                                returnObj.bunits = bunits;
                                                logger.debug("returnObj: ", returnObj);
                                                callback(null, returnObj);
                                                return;
                                            }
                                        });

                                    });
                                    // }

                                });
                                //}

                            });

                        }
                    })(x);
                }
            } else {
                callback(err, returnObj);
                return;
            }

        });
    }

    // check valid user permission
    this.checkPermission = function(username, callback) {
        logger.debug("User for permission: ", JSON.stringify(username));
        this.getLoggedInUser(username, function(err, anUser) {
            if (err) {
                callback(err, null);
            }
            if (anUser) {
                permissionsetDao.getPermissionSet(anUser.userrolename, function(err, permissionSet) {
                    if (err) {
                        callback(err, null);
                    }
                    if (permissionSet) {
                        logger.debug("Fetched permissionSet:>>>>>>> ", JSON.stringify(permissionSet));
                        callback(null, permissionSet);
                    } else {
                        callback(null, []);
                    }
                });
            } else {
                callback(null, []);
            }
        });

    }

    // Now not in use
    this.getJsonForNewTree = function(loggedInUser, callback) {
        var jsonTree = [];
        var businessGroups = [];
        var projects = [];
        var environments = [];
        var orgObj = {};
        this.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                callback(err, null);
            }
            if (anUser) {
                this.getOrgsByRowIds(anUser.orgname_rowid, function(err, orgList) {
                    if (err) {
                        callback(err, null);
                    }
                    if (orgList) {
                        for (var i = 0; i < orgList.length; i++) {
                            (function(orgCount) {
                                if (orgList[orgCount].id === "1") {
                                    orgObj = {
                                        name: orgList[orgCount].name,
                                        orgid: orgList[orgCount].rowid,
                                        rowid: orgList[orgCount].rowid,
                                        businessGroups: [],
                                        environments: []
                                    };
                                    d4dModelNew.d4dModelMastersProductGroup.find({
                                        orgname_rowid: orgList[orgCount].rowid
                                    }, function(err, bgs) {
                                        if (err) {
                                            callback(err, null);
                                        }
                                        if (bgs) {
                                            for (var x = 0; x < bgs.length; x++) {
                                                (function(bgCount) {
                                                    if (bgs[bgCount].id === "2") {
                                                        businessGroups.push(bgs[bgCount]);
                                                        d4dModelNew.d4dModelMastersProjects.find({
                                                            productgroupname_rowid: bgs[bgCount].rowid
                                                        }, function(err, project) {
                                                            if (err) {
                                                                callback(err, null);
                                                            }
                                                            if (project) {
                                                                for (var p = 0; p < project.length; p++) {
                                                                    (function(pCount) {
                                                                        if (project[pCount].id === "4") {
                                                                            projects.push({
                                                                                "name": bgs[bgCount].projectname,
                                                                                "rowid": project[pCount].rowid,
                                                                                "environments": project[pCount].environmentname
                                                                            });
                                                                        }
                                                                    })(p);
                                                                }
                                                                businessGroups.push(projects);
                                                            } else {
                                                                callback(null, jsonTree);
                                                            }
                                                        })
                                                    }

                                                })(x);
                                            }
                                            orgObj.businessGroups = businessGroups;
                                        } else {
                                            callback(null, jsonTree);
                                        }
                                    });
                                    d4dModelNew.d4dModelMastersEnvironments.find({
                                        orgname_rowid: orgList[orgCount].rowid
                                    }, function(err, envs) {
                                        if (err) {
                                            callback(err, null);
                                        }
                                        if (envs) {
                                            for (var e = 0; e < envs.length; e++) {
                                                (function(envCount) {
                                                    if (envs[envCount].id === "3") {
                                                        environments.push({
                                                            "name": envs[envCount].environmentname,
                                                            "rowid": envs[envCount].rowid
                                                        });
                                                    }
                                                })(e);
                                            }
                                            orgObj.environments = environments;
                                        } else {
                                            callback(null, jsonTree);
                                        }
                                    })
                                }
                            })(i);
                            jsonTree.push(orgObj);
                        }

                        callback(null, jsonTree);
                    } else {
                        callback(null, jsonTree);
                    }
                })
            }
        })
    }

    // check valid user permission
    this.getProjectsForOrg = function(orgId, callback) {
        var projectList = [];
        d4dModelNew.d4dModelMastersProjects.find({
            orgname_rowid: orgId
        }, function(err, projects) {
            if (err) {
                callback(err, null);
            }
            if (projects) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < projects.length; i++) {
                        (function(projectCount) {
                            if (projects[projectCount].id === '4') {
                                names = configmgmtDao.convertRowIDToValue(projects[projectCount].orgname_rowid, rowidlist);
                                bgnames = configmgmtDao.convertRowIDToValue(projects[projectCount].productgroupname_rowid, rowidlist);
                                logger.debug("getProjects===================== ",bgnames);
                                projects[projectCount].orgname = names;
                                projects[projectCount].productgroupname = bgnames;
                                //projectList.push(projects[projectCount]);
                                var envs = projects[projectCount].environmentname_rowid.split(",");
                                for(var e = 0;e< envs.length;e++){
                                    logger.debug("envs:::::::::::::: ",projects[projectCount].environmentname);
                                    envnames = configmgmtDao.convertRowIDToValue(envs[e], rowidlist);
                                    allEnvs =allEnvs+","+envnames;
                                }
                                allEnvs = allEnvs.substring(1);
                                projects[projectCount].environmentname = allEnvs;
                                projectList.push(projects[projectCount]);
                            }
                        })(i);
                    }
                    logger.debug("Returned Projects: ", JSON.stringify(projectList));
                    callback(null, projectList);
                    return;
                });
            } else {
                callback(null, projectList);
                return;
            }
        });

    }

    // Return all TemplateTypes
    this.getTemplateTypesById = function(anId, callback) {
        logger.debug("getTemplateTypesById called. ", JSON.stringify(anId));
        var templateTypeList = [];
        d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
            rowid: anId
        }, function(err, templateTypes) {
            if (err) {
                callback(err, null);
            }
            if (templateTypes) {
                configmgmtDao.getRowids(function(err, rowidlist) {
                    for (var i = 0; i < templateTypes.length; i++) {
                        if (templateTypes[i].id === '16') {
                            names = configmgmtDao.convertRowIDToValue(templateTypes[i].orgname_rowid, rowidlist)
                            templateTypes[i].orgname = names;
                            templateTypeList.push(templateTypes[i]);
                        }
                    }
                    callback(null, templateTypeList);
                    return;
                });
            } else {
                callback(null, templateTypeList);
                return;
            }

        });
    }

    this.updateAllSettings = function(orgId, orgName, callback) {
        d4dModelNew.d4dModelMastersOrg.find({
            rowid: orgId
        }, function(err, org) {
            if (err) {
                callback(err, null);
                return;
            }
            logger.debug("Got Org>>>>>>>>>>>>>>>>>>>>>>: ", JSON.stringify(org));
            d4dModelNew.d4dModelMastersProductGroup.update({
                orgname_rowid: orgId,
                id: '2'
            }, {
                $set: {
                    orgname: orgName
                }
            }, function(err, aBody) {
                if (err) {
                    logger.debug("Error to update Settings.");
                }
                logger.debug("Settings Updated............. ", JSON.stringify(aBody));

                d4dModelNew.d4dModelMastersProjects.update({
                    orgname_rowid: orgId,
                    id: '4'
                }, {
                    $set: {
                        orgname: orgName
                    }
                }, function(err, aBody) {
                    if (err) {
                        logger.debug("Error to update Settings.");
                    }
                    logger.debug("Settings Updated............. ", JSON.stringify(aBody));

                    d4dModelNew.d4dModelMastersEnvironments.update({
                        orgname_rowid: orgId,
                        id: '3'
                    }, {
                        $set: {
                            orgname: orgName
                        }
                    }, function(err, aBody) {
                        if (err) {
                            logger.debug("Error to update Settings.");
                        }
                        logger.debug("Settings Updated............. ", JSON.stringify(aBody));

                        d4dModelNew.d4dModelMastersConfigManagement.update({
                            orgname_rowid: orgId,
                            id: '10'
                        }, {
                            $set: {
                                orgname: orgName
                            }
                        }, function(err, aBody) {
                            if (err) {
                                logger.debug("Error to update Settings.");
                            }
                            logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                            d4dModelNew.d4dModelMastersDockerConfig.update({
                                orgname_rowid: orgId,
                                id: '18'
                            }, {
                                $set: {
                                    orgname: orgName
                                }
                            }, function(err, aBody) {
                                if (err) {
                                    logger.debug("Error to update Settings.");
                                }
                                logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                d4dModelNew.d4dModelMastersUsers.update({
                                    orgname_rowid: orgId,
                                    id: '7'
                                }, {
                                    $set: {
                                        orgname: orgName
                                    }
                                }, function(err, aBody) {
                                    if (err) {
                                        logger.debug("Error to update Settings.");
                                    }
                                    logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                    d4dModelNew.d4dModelMastersUserroles.update({
                                        orgname_rowid: orgId,
                                        id: '6'
                                    }, {
                                        $set: {
                                            orgname: orgName
                                        }
                                    }, function(err, aBody) {
                                        if (err) {
                                            logger.debug("Error to update Settings.");
                                        }
                                        logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                        d4dModelNew.d4dModelMastersDesignTemplateTypes.update({
                                            orgname_rowid: orgId,
                                            id: '16'
                                        }, {
                                            $set: {
                                                orgname: orgName
                                            }
                                        }, function(err, aBody) {
                                            if (err) {
                                                logger.debug("Error to update Settings.");
                                            }
                                            logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                            d4dModelNew.d4dModelMastersTemplatesList.update({
                                                orgname_rowid: orgId,
                                                id: '17'
                                            }, {
                                                $set: {
                                                    orgname: orgName
                                                }
                                            }, function(err, aBody) {
                                                if (err) {
                                                    logger.debug("Error to update Settings.");
                                                }
                                                logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                                d4dModelNew.d4dModelMastersServicecommands.update({
                                                    orgname_rowid: orgId,
                                                    id: '19'
                                                }, {
                                                    $set: {
                                                        orgname: orgName
                                                    }
                                                }, function(err, aBody) {
                                                    if (err) {
                                                        logger.debug("Error to update Settings.");
                                                    }
                                                    logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                                    d4dModelNew.d4dModelJenkinsConfig.update({
                                                        orgname_rowid: orgId,
                                                        id: '20'
                                                    }, {
                                                        $set: {
                                                            orgname: orgName
                                                        }
                                                    }, function(err, aBody) {
                                                        if (err) {
                                                            logger.debug("Error to update Settings.");
                                                        }
                                                        logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                                        d4dModelNew.d4dModelMastersTeams.find({
                                                            orgname_rowid: orgId,
                                                            id: '21'
                                                        }, function(err, teams) {
                                                            if (err) {
                                                                logger.debug("Error to get Settings.");
                                                            }
                                                            logger.debug("Got teams::::::::::::::: ", JSON.stringify(teams));

                                                            d4dModelNew.d4dModelMastersTeams.update({
                                                                orgname_rowid: {
                                                                    $in: orgId
                                                                },
                                                                id: '21'
                                                            }, {
                                                                $set: {
                                                                    orgname: orgName
                                                                }
                                                            }, function(err, aBody) {
                                                                if (err) {
                                                                    logger.debug("Error to update Settings.");
                                                                }
                                                                logger.debug("Settings Updated............. ", JSON.stringify(aBody));
                                                                callback(null, aBody);
                                                                return;
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }); // bu
        });
    }
}


module.exports = new MasterUtil();