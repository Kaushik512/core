var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');

var Task = require('../../tasks/tasks.js');

var Schema = mongoose.Schema;

var WorkflowSchema = new Schema({
    name: String,
    taskIds: [String],
});


var Workflow = mongoose.model('appWorkflows', WorkflowSchema);

module.exports = Workflow;