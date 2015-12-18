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
var AppDeployPipeline = require('_pr/model/app-deploy/appdeploy-pipeline');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/app/deploy/*', sessionVerificationFunc);
    app.post('/app/deploy/data/pipeline/configure', function(req, res) {
        var loggedInUser = req.session.user.cn;
        req.body.appDeployPipelineData.loggedInUser = loggedInUser;
        AppDeployPipeline.getAppDeployPipeline(req.body.appDeployPipelineData.projectId, function(err, appDeployes) {
            if (err) {
                res.status(500).send( errorResponses.db.error);
                return;
            }
            if (appDeployes.length) {
                appDeployes[0].envId = req.body.appDeployPipelineData.envId;
                appDeployes[0].envSequence = req.body.appDeployPipelineData.envSequence;
                
                appDeployes[0].save(function(err, appDeployes) {
                    if (err) {
                        res.status(500).send( "Pipeline Data Already Exist.");
                        return;
                    }
                    if (appDeployes) {
                        res.send(200, appDeployes);
                        return;
                    }
                });
            } else {
                AppDeployPipeline.createNew(req.body.appDeployPipelineData, function(err, appDeployes) {
                    if (err) {
                        res.status(500).send( "Pipeline Data Already Exist.");
                        return;
                    }
                    if (appDeployes) {
                        res.send(200, appDeployes);
                        return;
                    }
                });
            }
        });

    });
    app.get('/app/deploy/pipeline/project/:projectId', function(req, res) {
        AppDeployPipeline.getAppDeployPipeline(req.params.projectId, function(err, appDeployes) {
            if (err) {
                res.status(500).send( errorResponses.db.error);
                return;
            }
            if (appDeployes) {
                res.send(200, appDeployes);
                return;
            }
        });
    });
    app.post('/app/deploy/data/pipeline/update/configure/project/:projectId', function(req, res) {
        AppDeployPipeline.updateConfigurePipeline(req.params.projectId, req.body.appDeployPipelineUpdateData, function(err, appDeployes) {
            if (err) {
                res.send(403, "Pipeline Data Already Exist.");
                return;
            }
            if (appDeployes) {
                res.send(200, appDeployes);
                return;
            }
        });
    });
};