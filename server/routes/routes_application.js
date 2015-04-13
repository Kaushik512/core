var Application = require('../model/classes/application/application');

var logger = require('../lib/logger')(module);

module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/applications/*', sessionVerification);

    app.get('/applications/:applicationId', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            res.send(application);
        });
    });

    app.get('/applications/:applicationId/build', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.build(req.session.user.cn, function(err, buildRes) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(buildRes);
            });
        });
    });

    app.get('/applications/:applicationId/buildConf', function(req, res) {
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

    app.post('/applications/:applicationId/buildConf/buildParameters', function(req, res) {
        if (!req.body.buildParameters) {
            res.send(400, {
                message: "Invalid buildParameters"
            });
            return;
        }
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (application) {
                application.updateBuildParameters(req.body.buildParameters, function(err, build) {
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

    app.get('/applications/:applicationId/lastBuildInfo', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.getLastBuildInfo(function(err, lastBuildInfo) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                if (lastBuildInfo) {
                    res.send(lastBuildInfo);
                } else {
                    res.send(404, {
                        message: "Last Build Info not found"
                    });
                }
            });
        });
    });

    app.get('/applications/:applicationId/buildHistory', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.getBuildHistory(function(err, buildHistories) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(buildHistories);
            });
        });
    });

    app.get('/applications/:applicationId/lastDeployInfo', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.getLastDeploy(function(err, history) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(history);
            });
        });
    });

    app.get('/applications/:applicationId/deployHistory', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.getDeployHistory(function(err, deployHistories) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(deployHistories);
            });
        });
    });

    app.get('/applications/:applicationId/deployHistory/:deployHistoryId', function(req, res) {
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.getDeployHistoryById(req.params.deployHistoryId, function(err, history) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(history);
            });
        });
    });

    app.post('/applications/:applicationId/appInstances', function(req, res) {
        var appInstanceData = req.body.appInstanceData;
        if (!appInstanceData) {
            res.send(400);
            return;
        }
        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.addAppInstance(appInstanceData, function(err, appInstance) {
                logger.debug('added ', err);
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(appInstance);
            });
        });
    });

    app.delete('/applications/:applicationId/appInstances/:appInstanceId', function(req, res) {

        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.removeAppInstance(req.params.appInstanceId, function(err, appInstance) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(appInstance);
            });
        });
    });

    app.get('/applications/:applicationId/appInstances/:appInstanceId', function(req, res) {

        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            var appInstance = application.getAppInstance(req.params.appInstanceId);
            if (!appInstance) {
                res.send(404, {
                    message: 'AppInstance does not exist'
                });
            } else {
                res.send(appInstance);
            }

        });
    });


    app.get('/applications/:applicationId/appInstances/:appInstanceId/workflows', function(req, res) {

        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            var appInstance = application.getAppInstance(req.params.appInstanceId);
            if (!appInstance) {
                res.send(404, {
                    message: 'AppInstance does not exist'
                });
            } else {
                res.send(appInstance.workflows);
            }

        });
    });

    app.get('/applications/:applicationId/appInstances/:appInstanceId/workflows/:workflowId', function(req, res) {

        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            var appInstance = application.getAppInstance(req.params.appInstanceId);
            if (!appInstance) {
                res.send(404, {
                    message: 'AppInstance does not exist'
                });
            } else {
                var workflow;
                for (var i = 0; i < appInstance.workflows.length; i++) {
                    if (req.params.workflowId == appInstance.workflows[i]._id) {
                        workflow = appInstance.workflows[i];
                        break;
                    }
                }
                if (workflow) {
                    res.send(workflow);
                } else {
                    res.send(404, {
                        message: 'Workflow does not exist'
                    });
                }
            }
        });
    });

    app.get('/applications/:applicationId/appInstances/:appInstanceId/workflows/:workflowId/execute', function(req, res) {

        Application.getApplicationById(req.params.applicationId, function(err, application) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!application) {
                res.send(404, {
                    message: "application not founds"
                });
            }
            application.deploy(req.params.appInstanceId, req.params.workflowId, req.session.user.cn, function(err, tasks) {
                logger.debug('Workflow executed');
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(tasks);
            });
        });
    });
};