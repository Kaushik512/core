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
                logger.debug('added ',err);
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
            var appInstance = application.getAppInstance(req.params.appInstanceId);
            if (!appInstance) {
                res.send(404, {
                    message: 'AppInstance does not exist'
                });
            } else {
                appInstance.executeWorkflow(req.params.workflowId, req.session.user.cn, function(err, tasks) {
                    logger.debug('Workflow executed');
                    if (err) {
                        res.send(500, err);
                        return;
                    }

                    res.send(tasks);
                });
            }
        });
    });
};