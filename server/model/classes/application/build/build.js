var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

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
    buildHistoryIds: [String],
});


// instance method
// Do a build
buildSchema.methods.execute = function(user,callback) {
    var self = this;
    Task.getTaskById(self.taskId, function(err, task) {
        if (err) {
            logger.error(err);
            res.send(500, errorResponses.db.error);
            return;
        }
        task.execute(user, function(err, taskRes) {
            if (err) {
                logger.error(err);
                res.send(500, err);
                return;
            }
            callback(err,taskRes);
        });
    });
};

buildSchema.methods.getBuildHistoryById = function() {

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



var BuildModel = mongoose.model('appbuild', buildSchema);

module.exports = BuildModel;