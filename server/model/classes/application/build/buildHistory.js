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

var buildHistorySchema = new Schema({
    buildId: String,
    jenkinsServerId: String,
    jobName: String,
    jobNumber: String,
    status: String,
    user: String,
    timestampStarted: Number,
    timestampEnded: Number
});

// Do a build
buildHistorySchema.methods.getLogs = function() {

};

buildHistorySchema.methods.updateBuildStatus = function(status, callback) {
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

buildHistorySchema.statics.BUILD_STATUS = {
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed'
};

// Do a build
buildHistorySchema.statics.createNew = function(historyData, callback) {
    var self = this;
    var buildHistory = new BuildHistory(historyData);

    buildHistory.save(function(err, bHistory) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, bHistory);
    });
};

buildHistorySchema.statics.getHistoryByBuildId = function(buildId, callback) {
    var queryObj = {
        buildId: buildId
    };

    this.find(queryObj, function(err, histories) {
        if (err) {
            logger.error("Failed to getHistoryByBuildId :: ", buildId, err);
            callback(err, null);
            return;
        }
        //logger.debug(data);
        logger.debug("Exit getHistoryByBuildId :: ", buildId);
        callback(null, histories);
    });

};

buildHistorySchema.statics.getHistoryById = function(id, callback) {

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

var BuildHistory = mongoose.model('appBuildHistory', buildHistorySchema);

module.exports = BuildHistory;
