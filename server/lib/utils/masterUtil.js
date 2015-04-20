var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
    // Return All Orgs specific to User
	this.getOrgs = function (loggedInUser,callback){   
        var orgList = [];
            d4dModelNew.d4dModelMastersUsers.find({
                loginname: loggedInUser
            },function(err,users){
                if(err){
                    logger.debug("Unable to fetch User.");
                    callback(err,null);
                }
                logger.debug("Able to get User: ",JSON.stringify(users));
                if(users){
                    for(var x=0; x<users.length;x++){
                        (function(countUser){
                            if(users[countUser].id === '7'){
                                var orgIds = users[countUser].orgname_rowid;
                                logger.debug("orgIds: ",orgIds);
                                if(orgIds[0] === 'undefined'){
                                    d4dModelNew.d4dModelMastersOrg.find({
                                            id : "1"
                                            },function(err,orgs){
                                            if(err){
                                                logger.debug("Unable to fetch Org.");
                                                callback(err,null);
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to getch Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                            }
                                            logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                             callback(null,orgList);
                                        });
                                }
                                for(var i=0; i<orgIds.length;i++){

                                    (function(count){
                                        logger.debug("Org orgIds for query: ",orgIds[count]);
                                        d4dModelNew.d4dModelMastersOrg.find({
                                            rowid : orgIds[count]
                                            },function(err,orgs){
                                            if(err){
                                                logger.debug("Unable to fetch Org.");
                                                callback(err,null);
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to getch Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                            }
                                            logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                             callback(null,orgList);
                                        });
                                    })(i);
                                }
                            }
                        })(x);
                    }
                }
          });
	}

    // Return all BusinessGroups specific to User
    this.getBusinessGroups = function (orgList,callback){
        
        var productGroupList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersProductGroup.find({
            orgname_rowid: {$in:rowIds}
        },function(err,bgs){
            if(err){
                callback(err,null);
            }
            if(bgs){
                for(var i=0;i<bgs.length;i++){
                    (function(bgCount){
                        if(bgs[bgCount].id === '2'){
                            logger.debug("Returned BG: ",JSON.stringify(bgs[bgCount]));
                            productGroupList.push(bgs[bgCount]);
                        }
                    })(i);
                }
                logger.debug("productGroupList: ",JSON.stringify(productGroupList));
                //callback(null,productGroupList);
            }
            callback(null,productGroupList);
        });
    }

    // Return all Environments specific to User
    this.getEnvironments = function (orgList,callback){
        var envList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersEnvironments.find({
            orgname_rowid: {$in:rowIds}
        },function(err,envs){
            if(err){
                callback(err,null);
            }
            if(envs){
                for(var i=0;i<envs.length;i++){
                    (function(envCount){
                        if(envs[envCount].id === '3'){
                            envList.push(envs[envCount]);
                        }
                    })(i);
                }
                logger.debug("Returned ENVs: ",JSON.stringify(envList));
                //callback(null,envList);
            }
            callback(null,envList);
        });
    }

    // Return all Projects specific to User
    this.getProjects = function (orgList,callback){
        var projectList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersProjects.find({
            orgname_rowid: {$in:rowIds}
        },function(err,projects){
            if(err){
                callback(err,null);
            }
            if(projects){
                for(var i=0;i<projects.length;i++){
                    (function(projectCount){
                        if(projects[projectCount].id === '4'){
                            projectList.push(projects[projectCount]);
                        }
                    })(i);
                }
                logger.debug("Returned Projects: ",JSON.stringify(projectList));
                //callback(null,projectList);
            }
            callback(null,projectList);
        });
    }

    // Return all ConfigManagement specific to User
    this.getCongifMgmts = function(orgList,callback){
        var congifMgmtList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersConfigManagement.find({
            orgname_rowid : {$in:rowIds}
        },function(err,configMgmt){
            if(configMgmt){
                for(var i = 0; i< configMgmt.length; i++){
                    if(configMgmt[i].id === '10'){
                        congifMgmtList.push(configMgmt[i]);
                    }
                }
                callback(null,congifMgmtList);
            }else{
                callback(err,null);
            }
        });
    }

    // Return all Dockers
    this.getDockers = function(orgList,callback){
        var dockerList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersDockerConfig.find({
            orgname_rowid : {$in:rowIds}
        },function(err,dockers){
            if(dockers){
                for(var i =0; i< dockers.length; i++){
                    if(dockers[i].id === '18'){
                        dockerList.push(dockers[i]);
                    }
                }
                callback(null,dockerList);
            }else{
                callback(err,null);
            }

        });
    }

    // Return all Templates
    this.getTemplates = function(orgList,callback){
        var templateList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersTemplatesList.find({
            orgname_rowid : {$in:rowIds}
        },function(err,templates){
            if(templates){
                for(var i =0; i< templates.length; i++){
                    if(templates[i].id === '17'){
                        templateList.push(templates[i]);
                    }
                }
                callback(null,templateList);
            }else{
                callback(err,null);
            }

        });
    }

    // Return all TemplateTypes
    this.getTemplateTypes = function(orgList,callback){
        var templateTypeList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
            orgname_rowid : {$in:rowIds}
        },function(err,templateTypes){
            if(templateTypes){
                for(var i =0; i< templateTypes.length; i++){
                    if(templateTypes[i].id === '16'){
                        templateTypeList.push(templateTypes[i]);
                    }
                }
                callback(null,templateTypeList);
            }else{
                callback(err,null);
            }

        });
    }

    // Return all ServiceCommands
    this.getServiceCommands = function(orgList,callback){
        var serviceCommandList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersServicecommands.find({
            orgname_rowid : {$in:rowIds}
        },function(err,serviceCommands){
            if(serviceCommands){
                for(var i =0; i< serviceCommands.length; i++){
                    if(serviceCommands[i].id === '19'){
                        serviceCommandList.push(serviceCommands[i]);
                    }
                }
                callback(null,serviceCommandList);
            }else{
                callback(err,null);
            }

        });
    }

    // Return all Jenkins
    this.getJenkins = function(orgList,callback){
        var jenkinList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelJenkinsConfig.find({
            orgname_rowid : {$in:rowIds}
        },function(err,jenkins){
            if(jenkins){
                for(var i =0; i< jenkins.length; i++){
                    if(jenkins[i].id === '20'){
                        jenkinList.push(jenkins[i]);
                    }
                }
                callback(null,jenkinList);
            }else{
                callback(err,null);
            }

        });
    }

    // Return all UserRoles specific to User
    this.getUserRoles = function(loggedInUser,callback){
        var userRoleList = [];
        d4dModelNew.d4dModelMastersUsers.find({
            loginname : loggedInUser
        },function(err,users){
            if(users){
                for(var i1 =0; i1< users.length; i1++){
                    (function(i){
                    if(users[i].id === '7'){
                        d4dModelNew.d4dModelMastersUserroles.find({
                            userrolename : users[i].userrolename
                        },function(err,userRoles){
                            if(err){
                                    callback(err,null);
                                    }
                            if(userRoles){
                                for(var j1=0; j1< userRoles.length; j1++){
                                    (function(j){
                                    if(userRoles[j].id === '6'){
                                        userRoleList.push(userRoles[j]);
                                    }
                                })(j1);
                                }
                                 callback(null,userRoleList);
                            }

                        });
                    }
                })(i1);
                }
            }else{
                callback(err,null);
            }

        });
    }

    // Return all Users whose are associated to loggedIn User
    this.getUsers = function(loggedInUser,callback){
        var userList = [];
        d4dModelNew.d4dModelMastersUsers.find({
            loginname : loggedInUser
        },function(err,users){
            if(users){
                for(var i =0; i< users.length; i++){
                    if(users[i].id === '7'){
                        userList.push(users[i]);
                    }
                }
                callback(null,userList);
            }else{
                callback(err,null);
            }

        });
    }

    this.getTeams = function(loggedInUser,callback){
        var teamList = [];
        d4dModelNew.d4dModelMastersTeams.find({
            loginname : loggedInUser
        },function(err,teams){
            if(teams){
                for(var i=0; i< teams.length; i++){
                    if(teams[i].id === '21'){
                        teamList.push(teams[i]);
                    }
                }
                callback(null,teamList);
            }else{
                callback(err,null);
            }
        });
    }
}
module.exports = new MasterUtil();