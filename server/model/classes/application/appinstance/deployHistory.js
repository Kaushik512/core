/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('_pr/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Schema = mongoose.Schema;




var DeployHistorySchema = new Schema({
    applicationId: String,
    appInstanceId: String,
    workflowId: String,
    user: String,
    status: String,
    timestampStarted: Number,
    timestampEnded: Number

});

DeployHistorySchema.statics.DEPLOY_STATUS = {
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed'
};


DeployHistorySchema.methods.updateBuildStatus = function(status, callback) {
    this.status.status = status,
    this.save(function(err, history) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, history);
    });
};


// Do a build
DeployHistorySchema.statics.createNew = function(historyData, callback) {
    var self = this;
    var deployHistory = new DeployHistory(historyData);

    deployHistory.save(function(err, history) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, history);
    });
};

DeployHistorySchema.statics.getHistoryByAppInstanceId = function(appInstanceId, callback) {
    var queryObj = {
        appInstanceId: appInstanceId
    };

    this.find(queryObj, function(err, histories) {
        if (err) {
            logger.error("Failed to getHistoryByAppInstanceId :: ", appInstanceId, err);
            callback(err, null);
            return;
        }
        //logger.debug(data);
        logger.debug("Exit getHistoryByAppInstanceId :: ", appInstanceId);
        callback(null, histories);
    });

};

DeployHistorySchema.statics.getHistoryByApplicationId = function(applicationId, callback) {
    var queryObj = {
        applicationId: applicationId
    };

    this.find(queryObj, function(err, histories) {
        if (err) {
            logger.error("Failed to getHistoryByApplicationId :: ", applicationId, err);
            callback(err, null);
            return;
        }
        //logger.debug(data);
        logger.debug("Exit getHistoryByApplicationId :: ", applicationId);
        callback(null, histories);
    });

};


DeployHistorySchema.statics.getHistoryById = function(id, callback) {

    this.findById(id, function(err, history) {
        if (err) {
            logger.error("Failed to getHistoryById :: ", id, err);
            callback(err, null);
            return;
        }
        logger.debug("Exit getHistoryById :: ", id);
        callback(null, history);
    });

};

var DeployHistory = mongoose.model('appDeployHistory', DeployHistorySchema);

module.exports = DeployHistory;