var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Schema = mongoose.Schema;

var DeployHistorySchema = new Schema({

});


var DeployHistory = mongoose.model('appDeployHistory', DeployHistorySchema);

module.exports = DeployHistory; 