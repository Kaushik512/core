var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var taskTypeSchema = require('./taskTypeSchema');
var Tasks;


var compositeTaskSchema = taskTypeSchema.extend({
    jobName: String,
    assignTasks: [String]
});

// Instance Method :- run composite task
compositeTaskSchema.methods.execute = function(userName, baseUrl, choiceParam, onExecute, onComplete) {
    if (!Tasks) {
        Tasks = require('_pr/model/classes/tasks/tasks.js');
    }
    logger.debug("---------------------------------- ", JSON.stringify(this.assignTasks));
    var that = this;
    Tasks.getTaskByIds(this.assignTasks, function(err, tasks) {
        if (err) {
            if (typeof onExecute === 'function') {
                onExecute(err, null);
            }
            return;
        }
        
        if (typeof onExecute === 'function') {
            onExecute(null, null);
        }


        task = [];
        var assignTask = that.assignTasks;
        logger.debug("tasks =======================================iii: ", assignTask.length);
        for (var i = 0; i < assignTask.length; i++) {
            for (var j = 0; j < tasks.length; j++) {
                logger.debug("matched...... ", tasks[j].id);
                if (assignTask[i] === tasks[j].id) {
                    task.push(tasks[j]);
                }
            }
        }
        count = 0;
        logger.debug("tasks =======================================: ", task.length);

        function executeTasks() {
            task[count].execute(userName, baseUrl, choiceParam, function(err, taskExecuteData) {
                logger.debug("Calling...");
                if (err) {
                    return;
                }

            }, function(err, status) {
                if (err) {
                    if (typeof onComplete === 'function') {
                        onComplete(null, 1);
                    }
                    return;
                }
                count++;
                logger.debug("count======= ", count);
                if (count < tasks.length) {
                    if (status === 0) {
                        executeTasks();
                    } else {
                        onComplete(null, 1);
                    }
                } else {
                    onComplete(null, 0);
                }

            });
        }

        executeTasks();
    });
    logger.debug(this.assignTasks);
};

var CompositeTask = mongoose.model('compositeTask', compositeTaskSchema);

module.exports = CompositeTask;
