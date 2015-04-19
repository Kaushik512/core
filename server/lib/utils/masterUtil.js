var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
    // Return All Orgs specific to User
	this.getOrgs = function (loggedInUser,callback){   
        var orgList = [];
		      /*d4dModelNew.d4dModelMastersTeams.find({
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

            });*/
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
    this.getBusinessGroups = function (orgId,callback){
        logger.debug("org rowid: ",orgId);
        var productGroupList = [];
        d4dModelNew.d4dModelMastersProductGroup.find({
            orgname_rowid: orgId
        },function(err,bgs){
            if(err){
                callback(err,null);
            }
            if(bgs){
                for(var i=0;i<bgs.length;i++){
                    (function(bgCount){
                        if(bgs[i].id === '2'){
                            logger.debug("Returned BG: ",JSON.stringify(bgs[i]));
                            productGroupList.push(bgs[i]);
                        }
                    })(i);
                }
                logger.debug("productGroupList: ",JSON.stringify(productGroupList));
                callback(null,productGroupList);
            }
        });
    }

    // Return all Environments specific to User
    this.getEnvironments = function (orgId,callback){
        var envList = [];
        d4dModelNew.d4dModelMastersEnvironments.find({
            orgname_rowid: orgId
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
                callback(null,envList);
            }
        });
    }

    // Return all Projects specific to User
    this.getProjects = function (orgId,callback){
        var projectList = [];
        d4dModelNew.d4dModelMastersProjects.find({
            orgname_rowid: orgId
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
                callback(null,projectList);
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