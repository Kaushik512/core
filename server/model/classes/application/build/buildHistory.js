var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Schema = mongoose.Schema;

var buildHistory = new Schema({
    applicationId: String,
    buildId: String,
    jenkinsServerId: String,
    jobName: String,
    jobNumber: String,
    user: String,
    timestampStarted: Number,
    running: Boolean,
    success: Boolean,
});

// Do a build
buildHistory.methods.getLogs = function() {

};

// Do a build
buildHistory.statics.createNew = function() {

};

var BuildHistory = mongoose.model('appBuildHistory', buildHistory);

module.exports = BuildHistory;