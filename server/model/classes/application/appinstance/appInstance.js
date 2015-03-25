var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Workflow = require('./workflow'); 

var Schema = mongoose.Schema;

var AppInstanceSchema = new Schema({
    name: String,
    envId: String,
    workflows: [Workflow.schema],
    deployHistoryIds: [String]
});


var AppInstance = mongoose.model('appInstances', AppInstanceSchema);

module.exports = AppInstance;