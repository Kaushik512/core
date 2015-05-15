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


WorkflowSchema.methods.execute = function(username, baseUrl, callback, onComplete) {
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
        if (!tasks.length) {
            callback({
                message: "Tasks does not exists"
            }, null);
            return;
        }
        var count = 0;
        var onCompleteCount = 0;
        var overallSuccess = 0;

        function executeTasks(task) {
            task.execute(username, baseUrl, function(err, taskExecuteData) {
                count++;
                if (err) {
                    logger.error(err);
                }
                if (count < tasks.length) {
                    executeTasks(tasks[count]);
                } else {
                    callback(null, tasks);
                }
            }, function(err, status) {
                logger.debug('task finished');
                onCompleteCount++;
                if (err) {
                    overallSuccess = 1;
                } else {
                    if (status !== 0) {
                        overallSuccess = 1;
                    }
                }
                if (!(onCompleteCount < tasks.length)) {
                    if (typeof onComplete === 'function') {
                        onComplete(null, overallSuccess);
                    }
                }

            });
        }
        executeTasks(tasks[count]);

    });
}

var Workflow = mongoose.model('appWorkflows', WorkflowSchema);

module.exports = Workflow;