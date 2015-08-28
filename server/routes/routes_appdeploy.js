/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */


// The file contains all the end points for AppDeploy

var logger = require('_pr/logger')(module);
var AppDeploy = require('_pr/model/app-deploy/app-deploy');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/app/deploy/*', sessionVerificationFunc);

    // Get all AppDeploy
    app.get('/app/deploy', function(req, res) {
        AppDeploy.getAppDeploy(function(err, appDeployes) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (appDeployes) {
                res.send(200, appDeployes);
                return;
            }
        });
    });

    // Create AppDeploy
    app.post('/app/deploy', function(req, res) {
        logger.debug("Got appDeploy data: ", JSON.stringify(req.body.appDeployData));
        AppDeploy.createNew(req.body.appDeployData, function(err, appDeploy) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                res.send(200, appDeploy);
                return;
            }
        });
    });

    // Update AppDeploy
    app.post('/app/deploy/:appId/update', function(req, res) {
        logger.debug("Got appDeploy data: ", JSON.stringify(req.body.appDeployData));
        AppDeploy.getAppDeployById(req.params.appId, function(err, appDeploy) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!appDeploy) {
                res.send(404, "appDeploy not found!");
                return;
            }
            AppDeploy.updateAppDeploy(req.params.appId, req.body.appDeployData, function(err, appDeployes) {
                if (err) {
                    res.send(500, errorResponses.db.error);
                    return;
                }
                res.send(200, "Success");
            });
        });
    });

    // Get AppDeploy w.r.t. Id
    app.get('/app/deploy/:appId', function(req, res) {
        AppDeploy.getAppDeployById(req.params.appId, function(err, appDeploy) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                res.send(200, appDeploy);
                return;
            } else {
                res.send(404, "appDeploy not found!");
                return;
            }
        });
    });

    // Delete AppDeploy w.r.t. Id
    app.delete('/app/deploy/:appId', function(req, res) {
        AppDeploy.getAppDeployById(req.params.appId, function(err, appDeploy) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                AppDeploy.removeAppDeploy(req.params.appId, function(err, appDeployes) {
                    if (err) {
                        logger.debug("Error while removing appDeploy: ", JSON.stringify(appDeployes));
                        res(500, "Error while removing appDeploy:");
                        return;
                    }
                    if (gSettings) {
                        logger.debug("Successfully Removed appDeploy.");
                        res.send(200, "Successfully Removed appDeploy.");
                        return;
                    }
                });
            } else {
                res.send(404, "appDeploy not found!");
                return;
            }
        });
    });

    // Get AppDeploy w.r.t. appName and env
    app.get('/app/deploy/:appName/env/:envId', function(req, res) {
        AppDeploy.getAppDeployByNameAndEnvId(req.params.appName,req.params.envId, function(err, appDeploy) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                res.send(200, appDeploy);
                return;
            } else {
                res.send([]);
                return;
            }
        });
    });
};
