var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var BuildHistory = require('./buildHistory');
var Task = require('../../tasks/tasks.js');

var Schema = mongoose.Schema;

var buildSchema = new Schema({
    envId: String,
    taskId: String,
    functionalTestUrl: String,
    performanceTestUrl: String,
    securityTestUrl: String,
    nonFunctionalTestUrl: String,
    unitTestUrl: String,
    codeCoverageTestUrl: String,
    codeAnalysisUrl: String,
    uiPerformaceUrl: String,
    buildHistoryIds: [String],
});


// instance method
// Do a build
buildSchema.methods.execute = function(user, callback) {
    var self = this;
    Task.getTaskById(self.taskId, function(err, task) {
        if (err) {
            logger.error(err);
            res.send(500, errorResponses.db.error);
            return;
        }
        var timestampStarted = new Date().getTime();
        task.execute(user, function(err, taskRes) {
            if (err) {
                logger.error(err);
                callback(err, null)
                return;
            }
            logger.debug('creating build history');
            BuildHistory.createNew({
                buildId: self._id,
                jenkinsServerId: taskRes.jenkinsServerId,
                jobName: taskRes.jobName,
                jobNumber: taskRes.buildNumber,
                user: user,
                timestampStarted: timestampStarted,
            }, function(err, buildHistory) {
                if (err) {
                    logger.error("unable to save build history", err);
                    return;
                }
                self.buildHistoryIds.push(buildHistory._id);
                self.save();
            });
            callback(err, taskRes);
        });
    });
};

buildSchema.methods.getLastBuild = function(callback) {
    if (this.buildHistoryIds && this.buildHistoryIds.length) {
        BuildHistory.getHistoryById(this.buildHistoryIds[this.buildHistoryIds.length - 1], function(err, history) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, history);
        });
    } else {
        callback(null, null);
    }
};

buildSchema.methods.getHistory = function(callback) {
    BuildHistory.getHistoryByBuildId(this._id, function(err, histories) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, histories);
    });
};


// static methods 
buildSchema.statics.getBuildById = function(buildId, callback) {
    this.find({
        "_id": new ObjectId(buildId)
    }, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        //console.log('data ==>', data);
        if (data.length) {
            callback(null, data[0]);
        } else {
            callback(null, null);
        }
    });
};



var BuildModel = mongoose.model('appBuilds', buildSchema);

module.exports = BuildModel;