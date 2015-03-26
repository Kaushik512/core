var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');
var utils = require('../../utils/utils');

var Task = require('../../tasks/tasks.js');

var Schema = mongoose.Schema;

var WorkflowSchema = new Schema({
    name: String,
    taskIds: [String],
});

WorkflowSchema.methods.getNodes = function(callback) {
    if (!(this.taskIds && this.taskIds.length)) {
        callback(null, []);
        return;
    }
    var nodesList = [];
    Task.getTaskByIds(this.taskIds, function(err, tasks) {
        if (err) {
            callback(err, null);
            return;
        }
        for (var i = 0; i < tasks.length; i++) {
            var nodes = tasks[i].getChefTaskNodes();
            nodesList = utils.arrayMerge(nodesList, nodes);
        }
        callback(null, nodesList);
    });
}

var Workflow = mongoose.model('appWorkflows', WorkflowSchema);

module.exports = Workflow;