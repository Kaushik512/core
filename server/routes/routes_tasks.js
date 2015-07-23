var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');


var Jenkins = require('../lib/jenkins');

var errorResponses = require('./error_responses.js');

var Tasks = require('../model/classes/tasks/tasks.js');
var Application = require('../model/classes/application/application');
var instancesDao = require('../model/classes/instance/instance');
var TaskHistory = require('../model/classes/tasks/taskHistory');


var logger = require('../lib/logger')(module);

module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/tasks/*', sessionVerification);

    app.all('/tasks/:taskId/*', function(req, res, next) {
        Tasks.getTaskById(req.params.taskId, function(err, task) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if(task){
                configmgmtDao.getJenkinsDataFromId(task.taskConfig.jenkinsServerId, function(err, jenkinsData) {
                    if (err) {
                        logger.error('jenkins list fetch error', err);
                        res.send(500, errorResponses.db.error);
                        return;
                    } else {
                        if (!(jenkinsData && jenkinsData.length)) {
                            res.send(404, errorResponses.jenkins.notFound);
                            return;
                        }
                        req.CATALYST = {
                            jenkins: jenkinsData[0]
                        };
                        next();
                    }
                });
            }else{
                res.send(404);
                return;
            }
        });
    });

    app.get('/tasks/:taskId/run', function(req, res) {
        Tasks.getTaskById(req.params.taskId, function(err, task) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            task.execute(req.session.user.cn, req.protocol + '://' + req.get('host'), function(err, taskRes) {
                if (err) {
                    logger.error(err);
                    res.send(500, err);
                    return;
                }
                //console.log(taskRes);
                res.send(taskRes);
            });
        });

    });

    app.delete('/tasks/:taskId', function(req, res) {
        Application.getBuildsByTaskId(req.params.taskId, function(err, builds) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (builds && builds.length) {
                res.send(409, {
                    message: "An Application is using this task"
                });
                return;
            } else {
                instancesDao.removeTaskIdFromAllInstances(req.params.taskId, function(err, deleteCount) {
                    if (err) {
                        logger.error(err);
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    Tasks.removeTaskById(req.params.taskId, function(err, deleteCount) {
                        if (err) {
                            logger.error(err);
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                        if (deleteCount) {
                            res.send({
                                deleteCount: deleteCount
                            });
                        } else {
                            res.send(400);
                        }
                    });
                })
            }
        })

    });

    app.get('/tasks/:taskId', function(req, res) {
        Tasks.getTaskById(req.params.taskId, function(err, data) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (data) {
                res.send(data);
            } else {
                res.send(404);
            }
        });
    });

    app.get('/tasks/:taskId/history', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;
        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });

        Tasks.getTaskById(req.params.taskId, function(err, task) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (task) {
                if(task.taskType === 'jenkins' && task.taskConfig.autoSyncFlag === "true"){
                    TaskHistory.getLast100HistoriesByTaskId(req.params.taskId,function(err, histories) {
                            if (err) {
                                logger.debug(errorResponses.db.error);
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                        
                        var historyResult = [];
                        var jobResult =[];
                        if(histories.length > 0){
                            for(var i=0;i<histories.length;i++){
                                    historyResult.push(histories[i].buildNumber);
                                }
                            jenkins.getJobInfo(task.taskConfig.jobName, function(err, job) {
                                if (err) {
                                    logger.error('jenkins jobs fetch error', err);
                                    
                                }
                                
                                if(job){
                                    for(var j=0;j<job.builds.length;j++){
                                        jobResult.push(job.builds[j].number);
                                    }
                                }
                                var count= 0;
                                if(jobResult){
                                    for (var x=0 ; x < jobResult.length; x++ ) {
                                        count++;
                                        if ( historyResult.indexOf(jobResult[x]) == -1 ){
                                            logger.debug("------------------ ",jobResult[x]);
                                            var hData = {
                                                "taskId": req.params.taskId,
                                                "taskType": "jenkins",
                                                "user": req.session.user.cn,
                                                "jenkinsServerId": task.taskConfig.jenkinsServerId,
                                                "jobName": task.taskConfig.jobName,
                                                "status": "success",
                                                "timestampStarted": new Date().getTime(),
                                                "buildNumber": jobResult[x],
                                                "__v": 1,
                                                "timestampEnded": new Date().getTime(),
                                                "executionResults": [],
                                                "nodeIdsWithActionLog": [],
                                                "nodeIds": [],
                                                "runlist": []
                
                                            };
                                            TaskHistory.createNew(hData, function(err, taskHistoryEntry) {
                                                if (err) {
                                                    logger.error("Unable to make task history entry", err);
                                                    return;
                                                }
                                                logger.debug("Task history created");
                                            });
                                        }
                                        if(count === jobResult.length){
                                            task.getHistory(function(err, tHistories) {
                                                if (err) {
                                                    res.send(500, errorResponses.db.error);
                                                    return;
                                                }
                                                res.send(tHistories);
                                            });
                                        }
                                    }
                                }
                                        
                            });
                        }else{

                            var jobResult =[];
                            jenkins.getJobInfo(task.taskConfig.jobName, function(err, job) {
                                if (err) {
                                    logger.error('jenkins jobs fetch error', err);
                                    
                                }
                                
                                if(job){
                                    for(var j=0;j<job.builds.length;j++){
                                        jobResult.push(job.builds[j].number);
                                    }
                                }
                                var count =0;
                                if(jobResult){
                                    for (var x=0 ; x < jobResult.length; x++ ) {
                                        count++;
                                            logger.debug("------------------ ",jobResult[x]);
                                            var hData = {
                                                "taskId": req.params.taskId,
                                                "taskType": "jenkins",
                                                "user": req.session.user.cn,
                                                "jenkinsServerId": task.taskConfig.jenkinsServerId,
                                                "jobName": task.taskConfig.jobName,
                                                "status": "success",
                                                "timestampStarted": new Date().getTime(),
                                                "buildNumber": jobResult[x],
                                                "__v": 1,
                                                "timestampEnded": new Date().getTime(),
                                                "executionResults": [],
                                                "nodeIdsWithActionLog": [],
                                                "nodeIds": [],
                                                "runlist": []
                
                                            };
                                            TaskHistory.createNew(hData, function(err, taskHistoryEntry) {
                                                if (err) {
                                                    logger.error("Unable to make task history entry", err);
                                                    return;
                                                }
                                                logger.debug("Task history created");
                                            });
                                        if(count === jobResult.length){
                                            task.getHistory(function(err, tHistories) {
                                                if (err) {
                                                    res.send(500, errorResponses.db.error);
                                                    return;
                                                }
                                                res.send(tHistories);
                                            });
                                        }
                                    }
                                }
                                    
                            });
                        }
                    });
                }else{
                    task.getHistory(function(err, tHistories) {
                        if (err) {
                            res.send(500, errorResponses.db.error);
                            return;
                        }
                        res.send(tHistories);
                    });
                }
            } else {
                res.send(404);
            }
        });
    });

    app.post('/tasks', function(req, res) {
        Tasks.getTaskByIds(req.body.taskIds, function(err, data) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (data) {
                res.send(data);
            } else {
                res.send(404);
            }
        });
    });

    app.get('/tasks', function(req, res) {
        logger.debug("Enter get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
        Tasks.getTasksByOrgBgProjectAndEnvId(req.query.orgId, req.query.bgId, req.query.projectId, req.query.envId, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
        logger.debug("Exit get() for /organizations/%s/businessgroups/%s/projects/%s/environments/%s/tasks", req.params.orgId, req.params.bgId, req.params.projectId, req.params.envId);
    });

    app.post('/tasks/:taskId/update', function(req, res) {
        var taskData = req.body.taskData;

        Tasks.updateTaskById(req.params.taskId, taskData, function(err, updateCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (updateCount) {
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

    app.get('/tasks/history/list/all', function(req, res) {
        TaskHistory.listHistory(function(err, tHistories) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            res.send(tHistories);
        });
    });

};