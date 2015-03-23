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

};