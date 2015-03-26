var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');
var utils = require('../../utils/utils');


var Workflow = require('./workflow');

var Schema = mongoose.Schema;

var AppInstanceSchema = new Schema({
    name: String,
    envId: String,
    workflows: [Workflow.schema],
    deployHistoryIds: [String]
});

AppInstanceSchema.methods.getNodes = function(callback) {
    var self = this;
    var nodesList = [];
    count = 0;
    if (!this.workflows.length) {
        callback(null, nodesList);
        return;
    }

    function getWorkflowNodes(workflow) {
        workflow.getNodes(function(err, nodes) {
            count++;
            if (err) {
                callback(err, null);
                return;
            }
            nodesList = utils.arrayMerge(nodesList, nodes);
            if (count < self.workflows.length) {
                getWorkflowNodes(self.workflows[count]);
            } else {
                callback(null, nodesList);
            }
        });
    }
    getWorkflowNodes(this.workflows[count]);
};

var AppInstance = mongoose.model('appInstances', AppInstanceSchema);

module.exports = AppInstance;