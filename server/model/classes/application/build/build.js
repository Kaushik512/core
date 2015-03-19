var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

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

// Do a build
buildSchema.methods.build = function() {

};

buildSchema.methods.getBuildHistoryById = function() {

};


var BuildModel = mongoose.model('appbuild', buildSchema);

module.exports = BuildModel;