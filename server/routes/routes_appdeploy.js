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
var AppData = require('_pr/model/app-deploy/app-data');
var masterUtil = require('_pr/lib/utils/masterUtil.js');
var instancesDao = require('../model/classes/instance/instance');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/app/deploy/*', sessionVerificationFunc);

    // Get all AppDeploy
    app.get('/app/deploy', function(req, res) {
        AppDeploy.getAppDeploy(function(err, appDeployes) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeployes) {
                res.status(200).send(appDeployes);
                return;
            }
        });
    });

    // Create AppDeploy
    app.post('/app/deploy', function(req, res) {
        logger.debug("Got appDeploy data: ", JSON.stringify(req.body.appDeployData));
        var appDeployData = req.body.appDeployData;
        var instanceIp = appDeployData.applicationNodeIP.split(" ")[0];
        instancesDao.getInstanceByIP(instanceIp, function(err, instance) {
            if (err) {
                logger.error("Failed to fetch instance: ", err);
                res.status(500).send("Failed to fetch instance.");
                return;
            }
            if (instance.length) {
                var anInstance = instance[0];
                appDeployData['projectId'] = anInstance.projectId;
                AppDeploy.createNew(appDeployData, function(err, appDeploy) {
                    if (err) {
                        res.status(500).send(errorResponses.db.error);
                        return;
                    }
                    if (appDeploy) {
                        res.status(200).send(appDeploy);
                        return;
                    }
                });
            }else{
                res.status(404).send("Project not found for instanceip.");
                return;
            }
        });
    });

    // Get AppDeploy w.r.t. appName and env
    app.get('/app/deploy/env/:envId/project/:projectId/list', function(req, res) {
        logger.debug("/app/deploy/env/:envId/list called...");
        masterUtil.getAppDataWithDeployList(req.params.envId, req.params.projectId, function(err, appDeploy) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeploy.length) {
                res.status(200).send(appDeploy);
                return;
            } else {
                res.send([]);
                return;
            }
        });
    });

    // Get all AppData
    app.get('/app/deploy/data/list', function(req, res) {
        logger.debug("Data list api called...");
        AppData.getAppData(function(err, appDeployes) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeployes) {
                res.status(200).send(appDeployes);
                return;
            }
        });
    });

    // Create AppData
    app.post('/app/deploy/data/create', function(req, res) {
        AppData.createNew(req.body.appDeployData, function(err, appDeployes) {
            if (err) {
                res.status(403).send("Application Already Exist.");
                return;
            }
            if (appDeployes) {
                res.status(200).send(appDeployes);
                return;
            }
        });
    });

    // Get all AppData by name
    app.get('/app/deploy/data/env/:envName/:appName/project/:projectId/list', function(req, res) {
        masterUtil.getAppDataByName(req.params.envName, req.params.appName, req.params.projectId, function(err, appDatas) {
            if (err) {
                res.status(500).send("Please add app name.");
                return;
            }
            if (appDatas) {
                res.status(200).send(appDatas);
                return;
            }
        });
    });

    // Get all AppData
    app.get('/app/deploy/list', function(req, res) {
        AppData.getAppDataWithDeploy(function(err, appDeployes) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeployes) {
                res.status(200).send(appDeployes);
                return;
            }
        });
    });

    // Get respective Logs
    app.get('/app/deploy/:appId/logs', function(req, res) {
        logger.debug("Logs api called...");
        AppDeploy.getAppDeployById(req.params.appId, function(err, appDeploy) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (!appDeploy) {
                res.status(404).send("appDeploy not found!");
                return;
            }
            AppDeploy.getAppDeployLogById(req.params.appId, function(err, logs) {
                if (err) {
                    res.status(500).send(errorResponses.db.error);
                    return;
                }
                if (logs) {
                    res.status(200).send(logs);
                    return;
                } else {
                    res.status(404).send("Logs not available.");
                    return;
                }
            });
        });
    });

    // Get AppDeploy w.r.t. env
    app.get('/app/deploy/env/:envId', function(req, res) {
        logger.debug("Filtered by env called..");
        AppDeploy.getAppDeployByEnvId(req.params.envId, function(err, appDeploy) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                res.status(200).send(appDeploy);
                return;
            } else {
                res.send([]);
                return;
            }
        });
    });

    // Get AppDeploy w.r.t. projectId
    app.get('/app/deploy/project/:projectId/list', function(req, res) {
        logger.debug("Filtered by projectId called..");
        masterUtil.getAppDeployListForProject(req.params.projectId, function(err, appDeploy) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (appDeploy) {
                res.status(200).send(appDeploy);
                return;
            } else {
                res.send([]);
                return;
            }
        });
    });
};
