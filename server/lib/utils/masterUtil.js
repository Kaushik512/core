var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');
var ObjectId = require('mongoose').Types.ObjectId;
var permissionsetDao = require('../../model/dao/permissionsetsdao');

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
                    var count = 0;
                    var usrCount = 0;
                    var errOccured = false;
                    for(var x=0; x<users.length;x++){
                        (function(countUser){
                            logger.debug("x+++++++++++++++++++++++ ",countUser);
                            if(users[countUser].id === '7'){
                                usrCount++;
                                var orgIds = users[countUser].orgname_rowid;
                                logger.debug("orgIds: ",typeof orgIds[0]);
                                if(typeof orgIds[0] === 'undefined'){
                                    d4dModelNew.d4dModelMastersOrg.find({
                                            id : "1",
                                            active : true
                                            },function(err,orgs){
                                                count++;
                                            if(err){
                                                logger.debug("Unable to fetch Org.",err);
                                                errOccured = true;
                                                return;
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        logger.debug("y++++++++++++++++ ",countOrg);
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to get Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                               
                                        }
                                         if(count === usrCount) { 
                                                 logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                                 callback(errOccured,orgList);
                                                }
                                           
                                             
                                        });
                                }else{
                                
                                        logger.debug("Org orgIds for query: ",orgIds);
                                        d4dModelNew.d4dModelMastersOrg.find({
                                            rowid : {$in:orgIds},
                                            active : true
                                            },function(err,orgs){
                                                count++;
                                            if(err){
                                                logger.debug("Unable to fetch Org.",err);
                                                 errOccured = true;
                                                return;
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to get Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                            }
                                            logger.debug('count ==>',count, "user length = >",usrCount);
                                         if(count === usrCount) { 
                                                 logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                                 callback(errOccured,orgList);
                                                }
                                        });
                                   } 
                            }
                        })(x);
                    }
                } else {
                    callback(null,orgList);
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
            if(err){
                callback(err,null);
            }
            if(templates){
                for(var i =0; i< templates.length; i++){
                    if(templates[i].id === '17'){
                        templateList.push(templates[i]);
                    }
                }
                callback(null,templateList);
            }else{
                callback(null,templateList);
            }

        });
    }

    // Return all TemplateTypes
    this.getTemplateTypes = function(orgList,callback){
        logger.debug("getTemplateTypes called. ",JSON.stringify(orgList));
        var templateTypeList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
            orgname_rowid : {$in:rowIds}
        },function(err,templateTypes){
            if(err){
                callback(err,null);
            }
            if(templateTypes){
                for(var i =0; i< templateTypes.length; i++){
                    if(templateTypes[i].id === '16'){
                        templateTypeList.push(templateTypes[i]);
                    }
                }
                callback(null,templateTypeList);
            }else{
                callback(null,templateTypeList);
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

    // Return All Orgs specific to User
    this.getActiveOrgs = function (loggedInUser,callback){   
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
                    var count = 0;
                    var usrCount = 0;
                    var errOccured = false;
                    for(var x=0; x<users.length;x++){
                        (function(countUser){
                            logger.debug("x+++++++++++++++++++++++ ",countUser);
                            if(users[countUser].id === '7'){
                                usrCount++;
                                var orgIds = users[countUser].orgname_rowid;
                                logger.debug("orgIds: ",typeof orgIds[0]);
                                if(typeof orgIds[0] === 'undefined'){
                                    d4dModelNew.d4dModelMastersOrg.find({
                                            id : "1",
                                            active : true
                                            },function(err,orgs){
                                                count++;
                                            if(err){
                                                logger.debug("Unable to fetch Org.",err);
                                                errOccured = true;
                                                return;
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        logger.debug("y++++++++++++++++ ",countOrg);
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to get Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                               
                                        }
                                         if(count === usrCount) { 
                                                 logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                                 callback(errOccured,orgList);
                                                }
                                           
                                             
                                        });
                                }else{
                                
                                        logger.debug("Org orgIds for query: ",orgIds);
                                        d4dModelNew.d4dModelMastersOrg.find({
                                            rowid : {$in:orgIds},
                                            active : true
                                            },function(err,orgs){
                                                count++;
                                            if(err){
                                                logger.debug("Unable to fetch Org.",err);
                                                 errOccured = true;
                                                return;
                                            }
                                            if(orgs){
                                                for(var y=0;y<orgs.length;y++){
                                                    (function(countOrg){
                                                        if(orgs[countOrg].id === '1'){
                                                            logger.debug("Able to get Org.",JSON.stringify(orgs[countOrg]));
                                                            orgList.push(orgs[countOrg]);
                                                        }
                                                    })(y);
                                                }
                                            }
                                            logger.debug('count ==>',count, "user length = >",usrCount);
                                         if(count === usrCount) { 
                                                 logger.debug("Returned Orgs: ",JSON.stringify(orgList));
                                                 callback(errOccured,orgList);
                                                }
                                        });
                                   } 
                            }
                        })(x);
                    }
                } else {
                    callback(null,orgList);
                }
          });
    }

    this.getUserRoles = function(callback){
        var userRoleList = [];
        d4dModelNew.d4dModelMastersUserroles.find({
                            id : "6"
                        },function(err,userRoles){
                            if(err){
                                    callback(err,null);
                                    }
                            if(userRoles){
                                for(var j1=0; j1< userRoles.length; j1++){
                                    if(userRoles[j1].id === '6'){
                                        userRoleList.push(userRoles[j1]);
                                    }
                                }
                                 callback(null,userRoleList);
                            }else{
                                callback(null,userRoleList);
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

    // Return all Users whose are associated to loggedIn User
    this.getUsersForOrg = function(orgList,callback){
        var userList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersUsers.find({
            orgname_rowid : rowIds
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


    this.getTeams = function(orgList,callback){
        var teamList = [];
        var rowIds = [];
        for(var x=0;x<orgList.length;x++){
            rowIds.push(orgList[x].rowid);
        }
        logger.debug("org rowids: ",rowIds);
        d4dModelNew.d4dModelMastersTeams.find({
            orgname_rowid : {$in:rowIds}
        },function(err,teams){
            if(err){
                callback(err,null);
            }
            logger.debug("Able to fetch Team: ",JSON.stringify(teams));
            if(teams){
                for(var i=0; i< teams.length; i++){
                    if(teams[i].id === '21'){
                        teamList.push(teams[i]);
                    }
                }
                callback(null,teamList);
            }else{
                callback(null,teamList);
            }
        });
    }

    this.getOrgById = function(orgId,callback){
        var orgList = [];
        logger.debug("Incomming orgid: ",orgId);
        d4dModelNew.d4dModelMastersOrg.find({
            _id : new ObjectId(orgId)
        },function(err,orgs){
            if(orgs){
                for(var i=0; i< orgs.length; i++){
                    if(orgs[i].id === '1'){
                        orgList.push(orgs[i]);
                    }
                }
                callback(null,orgList);
            }else{
                callback(err,null);
            }
        });
    }

    // Now not in use
    getOrgsByRowIds = function(orgIds,callback){
        var orgList = [];
        logger.debug("Incomming orgid: ",orgIds);
        d4dModelNew.d4dModelMastersOrg.find({
            rowid : {$in:orgIds}
        },function(err,orgs){
            if(orgs){
                for(var i=0; i< orgs.length; i++){
                    if(orgs[i].id === '1'){
                        orgList.push(orgs[i]);
                    }
                }
                callback(null,orgList);
            }else{
                callback(err,null);
            }
        });
    }

    // Return only loggedIn User.
    this.getLoggedInUser = function(loggedInUser,callback){
        var anUser;
        d4dModelNew.d4dModelMastersUsers.find({
            loginname : loggedInUser
        },function(err,users){
            if(users){
                for(var i =0; i< users.length; i++){
                    if(users[i].id === '7'){
                        anUser = users[i];
                    }
                }
                callback(null,anUser);
            }else{
                callback(err,null);
            }

        });
    }

// Return all settings for User.
    this.getAllSettingsForUser = function(loggedInUser,callback){
        var userid;
        var teams =[];
        var orgs =[];
        var projects =[];
        var bunits =[];
        var returnObj={};
        d4dModelNew.d4dModelMastersUsers.find({
            loginname : loggedInUser
        },function(err,users){
            if(users){
                for(var x =0;x<users.length;x++){
                    (function(usr){
                    if(users[usr].id==='7'){
                        logger.debug("Got User");
                        returnObj={
                            userid : users[usr].rowid,
                            teams:[],
                            orgs:[],
                            projects:[],
                            bunits:[]
                        };
                        d4dModelNew.d4dModelMastersTeams.find({
                            orgname_rowid: {$in:users[usr].orgname_rowid}
                        },function(err,team){
                            logger.debug("Available team: ",JSON.stringify(team));
                            if(team){
                            for(var tm =0;tm<team.length;tm++){
                                if(team[tm].id === '21'){
                                    logger.debug("Inside team : ",team[tm].rowid);
                                    teams.push(team[tm].rowid);
                                }
                            }
                        }
                            logger.debug("Team array: ",JSON.stringify(teams));
                            returnObj.teams=teams;
                            d4dModelNew.d4dModelMastersOrg.find({
                                rowid:{$in:users[usr].orgname_rowid},
                                active : true
                            },function(err,org){
                                if(err){
                                    callback(err,null);
                                }
                                if(org){
                                    logger.debug("Available Org: ",JSON.stringify(org));
                                    for(var x=0;x<org.length;x++){
                                        if(org[x].id === '1'){
                                            orgs.push(org[x].rowid);
                                            logger.debug("Orgs list rowid: ",org[x].rowid);
                                        }
                                    }
                                    returnObj.orgs = orgs;
                                }
                                    d4dModelNew.d4dModelMastersProjects.find({
                                        orgname_rowid: {$in:users[usr].orgname_rowid}
                                    },function(err,project){
                                            if(err){
                                                callback(err,null);
                                            }
                                            if(project){
                                                logger.debug("Available project:>>>>> ",JSON.stringify(project));
                                                for(var x1=0;x1<project.length;x1++){
                                                    if(project[x1].id === '4'){
                                                        projects.push(project[x1].rowid);
                                                        logger.debug("projectList:>>> ",project[x1].rowid);
                                                    }
                                                }
                                                returnObj.projects = projects;
                                            }
                                            d4dModelNew.d4dModelMastersProductGroup.find({
                                                orgname_rowid: {$in:users[usr].orgname_rowid}
                                            },function(err,bg){
                                                if(err){
                                                    callback(err,null);
                                                }
                                                if(bg){
                                                    for(var x2=0;x2<bg.length;x2++){
                                                        if(bg[x2].id === '2'){
                                                            bunits.push(bg[x2].rowid);
                                                        }
                                                    }
                                                    returnObj.bunits=bunits;
                                                    logger.debug("returnObj: ",returnObj);
                                                    callback(null,returnObj);
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
            }else{
                callback(err,returnObj);
            }

        });
    }

    // check valid user permission
    this.checkPermission = function(username,callback){
        logger.debug("User for permission: ",JSON.stringify(username));
        this.getLoggedInUser(username,function(err,anUser){
            if(err){
                callback(err,null);
            }
            if(anUser){
                permissionsetDao.getPermissionSet(anUser.userrolename,function(err,permissionSet){
                    if(err){
                        callback(err,null);
                    }
                    if(permissionSet){
                        logger.debug("Fetched permissionSet:>>>>>>> ",JSON.stringify(permissionSet));
                        callback(null,permissionSet);
                    }else{
                        callback(null,[]);
                    }
                });
              }else{
                callback(null,[]);
              }
        });

    }

    // Now not in use
    this.getJsonForNewTree = function(loggedInUser,callback){
        var jsonTree = [];
        var businessGroups =[];
        var projects = [];
        var environments =[];
        var orgObj = {};
        this.getLoggedInUser(loggedInUser,function(err,anUser){
            if(err){
                callback(err,null);
            }
            if(anUser){
                this.getOrgsByRowIds(anUser.orgname_rowid,function(err,orgList){
                    if(err){
                        callback(err,null);
                    }
                    if(orgList){
                        for(var i = 0;i<orgList.length;i++){
                            (function(orgCount){
                                if(orgList[orgCount].id === "1"){
                                    orgObj = {
                                        name: orgList[orgCount].name,
                                        orgid: orgList[orgCount].rowid,
                                        rowid: orgList[orgCount].rowid,
                                        businessGroups: [],
                                        environments: []
                                    };
                                    d4dModelNew.d4dModelMastersProductGroup.find({
                                        orgname_rowid : orgList[orgCount].rowid
                                    },function(err,bgs){
                                        if(err){
                                            callback(err,null);
                                        }
                                        if(bgs){
                                            for(var x=0;x<bgs.length;x++){
                                                (function(bgCount){
                                                    if(bgs[bgCount].id === "2"){
                                                        businessGroups.push(bgs[bgCount]);
                                                        d4dModelNew.d4dModelMastersProjects.find({
                                                            productgroupname_rowid: bgs[bgCount].rowid
                                                        },function(err,project){
                                                            if(err){
                                                                callback(err,null);
                                                            }
                                                            if(project){
                                                                for(var p=0;p<project.length;p++){
                                                                    (function(pCount){
                                                                        if(project[pCount].id === "4"){
                                                                            projects.push({"name":bgs[bgCount].projectname,"rowid":project[pCount].rowid,"environments":project[pCount].environmentname});
                                                                        }
                                                                    })(p);
                                                                }
                                                                businessGroups.push(projects);
                                                            }else{
                                                                callback(null,jsonTree);
                                                            }
                                                        })
                                                    }

                                                })(x);
                                            }
                                            orgObj.businessGroups = businessGroups;
                                        }else{
                                            callback(null,jsonTree);
                                        }
                                    });
                                    d4dModelNew.d4dModelMastersEnvironments.find({
                                        orgname_rowid: orgList[orgCount].rowid
                                    },function(err,envs){
                                        if(err){
                                            callback(err,null);
                                        }
                                        if(envs){
                                            for(var e=0;e<envs.length;e++){
                                                (function(envCount){
                                                    if(envs[envCount].id === "3"){
                                                        environments.push({"name":envs[envCount].environmentname,"rowid":envs[envCount].rowid});
                                                    }
                                                })(e);
                                            }
                                            orgObj.environments = environments;
                                        }else{
                                            callback(null,jsonTree);
                                        }
                                    })
                                }
                            })(i);
                            jsonTree.push(orgObj);
                        }

                        callback(null,jsonTree);
                    }else{
                        callback(null,jsonTree);
                    }
                })
            }
        })
    }

    // check valid user permission
    this.getProjectsForOrg = function(orgId,callback){
        var projectList =[];
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
                //callback(null,projectList);
            }
            callback(null,projectList);
        });

    }

    // Return all TemplateTypes
    this.getTemplateTypesById = function(anId,callback){
        logger.debug("getTemplateTypesById called. ",JSON.stringify(anId));
        var templateTypeList = [];
        d4dModelNew.d4dModelMastersDesignTemplateTypes.find({
            rowid : anId
        },function(err,templateTypes){
            if(err){
                callback(err,null);
            }
            if(templateTypes){
                for(var i =0; i< templateTypes.length; i++){
                    if(templateTypes[i].id === '16'){
                        templateTypeList.push(templateTypes[i]);
                    }
                }
                callback(null,templateTypeList);
            }else{
                callback(null,templateTypeList);
            }

        });
    }
}


module.exports = new MasterUtil();