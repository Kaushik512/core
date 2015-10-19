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
    // Create AppData with check isEnabled.
    app.post('/app/deploy/data/pipeline/configure', function(req, res) {
    	//var loggedInUser = req.session.user.cn;
    	//console.log(req.session.user.cn);
    	//dataDeployPipeline.appDeployPipelineData.loggedInUser = req.session.user.cn;
        AppDeployPipeline.createNew(req.body.appDeployPipelineData, function(err, appDeployes) {
        	//logger.debug("I am in routes_appPipeline");
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
