var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
    // Return All Orgs specific to User
	this.getOrgs = function (loggedInUser,callback){
        var orgList = [];
		d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i1 =0; i1< teams.length; i1++){
                        (function(i){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(err){
                                    callback(err,null);
                                }
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j1 =0; j1< projects.length; j1++){
                                        (function(j){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersOrg.find({
                                            orgname : projects[j].orgname
                                            },function(err,orgs){
                                                if(err){
                                                    callback(err,null);
                                                }
                                            if(orgs){
                                                for(var x1 = 0; x1< orgs.length; x1++){
                                                    (function(x){
                                                    if(orgs[x].id ==='1'){
                                                logger.debug("Returned Org: >>>>>>> ",JSON.stringify(orgs[x]));
                                                    orgList.push(orgs[x]);
                                                  }
                                              })(x1);
                                                }
                                                logger.debug("callback fire..");
                                                 callback(null,orgList);
                                              }

                                            });
                                        }
                                    })(j1);
                                    }
                                }

                            });
                        }
                    })(i1);
                    }
                   // callback(null,orgList);
                }else{
                    callback(err,null);
                }

            });
	}

    // Return all BusinessGroups specific to User
    this.getBusinessGroups = function (loggedInUser,callback){
        var productGroupList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i1 =0; i1< teams.length; i1++){
                        (function(i){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(err){
                                        callback(err,null);
                                     }
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j1 =0; j1< projects.length; j1++){
                                        (function(j){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersProductGroup.find({
                                            productgroupname : projects[j].productgroupname
                                            },function(err,productGroups){
                                                if(err){
                                                    callback(err,null);
                                                    }
                                            if(productGroups){
                                                for(var x1 = 0; x1< productGroups.length; x1++){
                                                    (function(x){
                                                    if(productGroups[x].id ==='2'){
                                                logger.debug("Returned BG: >>>>>>> ",JSON.stringify(productGroups[x]));
                                                    productGroupList.push(productGroups[x]);
                                                  }
                                              })(x1);
                                                }
                                                 callback(null,productGroupList);
                                              }

                                            });
                                        }
                                    })(j1);
                                    }
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

    // Return all Environments specific to User
    this.getEnvironments = function (loggedInUser,callback){
        var envList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i1 =0; i1< teams.length; i1++){
                        (function(i){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(err){
                                        callback(err,null);
                                        }
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j1 =0; j1< projects.length; j1++){
                                        (function(j){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersEnvironments.find({
                                            environmentname : projects[j].environmentname
                                            },function(err,envs){
                                                if(err){
                                                    callback(err,null);
                                                 }
                                            if(envs){
                                                for(var x1 = 0; x1< envs.length; x1++){
                                                    (function(x){
                                                    if(envs[x].id ==='3'){
                                                    logger.debug("Returned Env: >>>>>>> ",JSON.stringify(envs[x]));
                                                    envList.push(envs[x]);
                                                  }
                                              })(x1);
                                                }
                                                 callback(null,envList);
                                              }

                                            });
                                        }
                                    })(j1);
                                    }
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

    // Return all Projects specific to User
    this.getProjects = function (loggedInUser,callback){
        var projectList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i1 =0; i1< teams.length; i1++){
                        (function(i){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(err){
                                        callback(err,null);
                                        }
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j1 =0; j1< projects.length; j1++){
                                        (function(j){
                                        if(projects[j].id === '4'){
                                            projectList.push(projects[j]);
                                        }
                                    })(j1);
                                    }
                                    callback(null,projectList);
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

    // Return all ConfigManagement specific to User
    this.getCongifMgmts = function(loggedInUser,callback){
        var congifMgmtList = [];
        d4dModelNew.d4dModelMastersConfigManagement.find({
            loginname : loggedInUser
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
    this.getDockers = function(anId,callback){
        var dockerList = [];
        logger.debug("Enter to Docker: ",anId);
        d4dModelNew.d4dModelMastersDockerConfig.find({
            id : anId
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
    this.getTemplates = function(anId,callback){
        var templateList = [];
        logger.debug("Enter to Template: ",anId);
        d4dModelNew.d4dModelMastersTemplatesList.find({
            id : anId
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

    // Return all ServiceCommands
    this.getServiceCommands = function(anId,callback){
        var serviceCommandList = [];
        d4dModelNew.d4dModelMastersServicecommands.find({
            id : anId
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
    this.getJenkins = function(anId,callback){
        var jenkinList = [];
        d4dModelNew.d4dModelJenkinsConfig.find({
            id : anId
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