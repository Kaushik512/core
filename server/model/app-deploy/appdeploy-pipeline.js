/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Arabinda Behera <arabinda.behera@relevancelab.com>,
 * October 2015
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');
var schemaValidator = require('_pr/model/utils/schema-validator');

// File which contains App Deploy Pipeline DB schema and DAO methods.

var Schema = mongoose.Schema;

var AppDeployPipelineSchema = new Schema({
    orgId: String,
    bgId: String,
    projectId: String,
    envId: String,
    loggedInUser: String,
    isEnabled: Boolean
});

// Save all appData informations.
AppDeployPipelineSchema.statics.createNew = function(appDeployPipelineData, callback) {
    var aDeploy = new this(appDeployPipelineData);
    this.find({
        projectId: appDeployPipelineData.projectId
    }, function(err, data) {
        //logger.debug("I am in appdeploy_Pipeline");
        //logger.debug(data);
        if (err) {
            logger.debug("Error fetching record.", err);
        }
        else {
            aDeploy.save(function(err, appDeploy) {
                if (err) {
                    logger.debug("Got error while creating AppDeploy: ", err);
                    callback(err, null);
                }
                if (appDeploy) {
                    logger.debug("Creating AppDeploy: ", JSON.stringify(appDeploy));
                    callback(null, appDeploy);
                }
            });
        }
    });
};

var AppDataPipeline = mongoose.model("appDataPipeline", AppDeployPipelineSchema);
module.exports = AppDataPipeline;
