var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
	this.getOrgs = function (loggedInUser,callback){
        var orgList = [];
		d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i =0; i< teams.length; i++){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j =0; j< projects.length; j++){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersOrg.find({
                                            orgname : projects[j].orgname
                                            },function(err,orgs){
                                            if(orgs){
                                                for(var x = 0; x< orgs.length; x++){
                                                    if(orgs[x].id ==='1'){
                                                logger.debug("Returned Org: >>>>>>> ",JSON.stringify(orgs[x]));
                                                    orgList.push(orgs[x]);
                                                  }
                                                }
                                                 callback(orgList);
                                              }

                                            });
                                        }
                                    }
                                }

                            });
                        }
                    }
                }

            });
	}

    this.getBusinessGroups = function (loggedInUser,callback){
        var productGroupList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i =0; i< teams.length; i++){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j =0; j< projects.length; j++){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersProductGroup.find({
                                            productgroupname : projects[j].productgroupname
                                            },function(err,productGroups){
                                            if(productGroups){
                                                for(var x = 0; x< productGroups.length; x++){
                                                    if(productGroups[x].id ==='2'){
                                                logger.debug("Returned BG: >>>>>>> ",JSON.stringify(productGroups[x]));
                                                    productGroupList.push(productGroups[x]);
                                                  }
                                                }
                                                 callback(productGroupList);
                                              }

                                            });
                                        }
                                    }
                                }

                            });
                        }
                    }
                }

            });
    }

    this.getEnvironments = function (loggedInUser,callback){
        var envList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i =0; i< teams.length; i++){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j =0; j< projects.length; j++){
                                        if(projects[j].id === '4'){
                                            d4dModelNew.d4dModelMastersEnvironments.find({
                                            environmentname : projects[j].environmentname
                                            },function(err,envs){
                                            if(envs){
                                                for(var x = 0; x< envs.length; x++){
                                                    if(envs[x].id ==='3'){
                                                    logger.debug("Returned Env: >>>>>>> ",JSON.stringify(envs[x]));
                                                    envList.push(envs[x]);
                                                  }
                                                }
                                                 callback(envList);
                                              }

                                            });
                                        }
                                    }
                                }

                            });
                        }
                    }
                }

            });
    }

    this.getProjects = function (loggedInUser,callback){
        var projectList = [];
        d4dModelNew.d4dModelMastersTeams.find({
                loginname : loggedInUser
            },function(err,teams){
                if(teams){
                    logger.debug("Team size: ",teams.length);
                    logger.debug("Returned Team>>>>> ",JSON.stringify(teams));
                    for(var i =0; i< teams.length; i++){
                        if(teams[i].id === '21' && loggedInUser === teams[i].loginname){
                            logger.debug("Only Team: ",JSON.stringify(teams[i]));
                            d4dModelNew.d4dModelMastersProjects.find({
                                projectname : teams[i].projectname
                            },function(err,projects){
                                if(projects){
                                    logger.debug("Returned Project:>>>>>> ",JSON.stringify(projects));
                                    for(var j =0; j< projects.length; j++){
                                        if(projects[j].id === '4'){
                                            projectList.push(projects[j]);
                                        }
                                    }
                                    callback(projectList);
                                }

                            });
                        }
                    }
                }

            });
    }

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
                callback(congifMgmtList);
            }
        });
    }

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
                callback(dockerList);
            }

        });
    }

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
                callback(templateList);
            }

        });
    }

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
                callback(serviceCommandList);
            }

        });
    }

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
                callback(jenkinList);
            }

        });
    }
}
module.exports = new MasterUtil();