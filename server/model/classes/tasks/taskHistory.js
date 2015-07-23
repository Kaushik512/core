var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../lib/logger')(module);
var schemaValidator = require('../../dao/schema-validator');

var Schema = mongoose.Schema;

var taskHistorySchema = new Schema({
    taskId: String,
    taskType: String,
    runlist: [String],
    nodeIds: [String],
    nodeIdsWithActionLog: [{
        nodeId: String,
        actionLogId: String
    }],
    attributes: Schema.Types.Mixed,
    jenkinsServerId: String,
    jobName: String,
    buildNumber: Number,
    status: String,
    user: String,
    timestampStarted: Number,
    timestampEnded: Number,
    executionResults: [Schema.Types.Mixed]
});

taskHistorySchema.method.update = function(status, timestampEnded, callback) {
    var self = this;
    var taskHistory = new self(historyData);

    taskHistory.save(function(err, tHistory) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tHistory);
    });
};

taskHistorySchema.statics.createNew = function(historyData, callback) {
    var self = this;
    var taskHistory = new self(historyData);

    taskHistory.save(function(err, tHistory) {
        logger.debug('saving task history ==>');
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tHistory);
    });
};

taskHistorySchema.statics.getHistoryByTaskId = function(taskId, callback) {
    logger.debug("=============",typeof taskId);
    var query = {
        taskId: taskId
    }
    this.find({ $query : query ,$orderby :{"buildNumber" : -1}}, function(err, tHistories) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tHistories);
    });
};

taskHistorySchema.statics.getLast100HistoriesByTaskId = function(taskId, callback) {

    this.find({
        taskId: taskId
    }, function(err, tHistories) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tHistories);
    }).sort({$natural: -1}).limit(100);
};

taskHistorySchema.statics.listHistory = function(callback) {

    this.find(function(err, tHistories) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tHistories);
    });
};

var TaskHistory = mongoose.model('taskHistory', taskHistorySchema);

module.exports = TaskHistory;