var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Schema = mongoose.Schema;

var buildHistory = new Schema({
    buildId: String,
    jenkinsServerId: String,
    jobName: String,
    jobNumber: String,
    user: String,
    timestampStarted: Number,
});

// Do a build
buildHistory.methods.getLogs = function() {

};

// Do a build
buildHistory.statics.createNew = function(historyData, callback) {
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

buildHistory.statics.getHistoryByBuildIds = function(buildId, callback) {
    var queryObj = {
    	buildId : buildId
    };
    
    BuildHistory.find(queryObj, function(err, histories) {
        if (err) {
            logger.error("Failed to getHistoryByBuildIds :: ", buildId, err);
            callback(err, null);
            return;
        }
        //logger.debug(data);
        logger.debug("Exit getHistoryByBuildIds :: ", buildId);
        callback(null, histories);
    });

};

var BuildHistory = mongoose.model('appBuildHistory', buildHistory);

module.exports = BuildHistory;