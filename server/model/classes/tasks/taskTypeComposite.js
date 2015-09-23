var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var taskTypeSchema = require('./taskTypeSchema');
var TaskHistory = require('./taskHistory');



var compositeTaskSchema = taskTypeSchema.extend({
    assignTasks: [String]
});

// Instance Method :- run composite task
compositeTaskSchema.methods.execute = function(userName, baseUrl, choiceParam, onExecute, onComplete) {
    var Tasks;
    var taskHistory = new TaskHistory();
    if (!Tasks) {
        Tasks = require('_pr/model/classes/tasks/tasks.js');
    }
    var that = this;
    Tasks.getTaskByIds(this.assignTasks, function(err, tasks) {
        if (err) {
            if (typeof onExecute === 'function') {
                onExecute(err, null);
            }
            return;
        }

        if (typeof onExecute === 'function') {
            onExecute(null, null, taskHistory);
        }


        task = [];
        var assignTask = that.assignTasks;
        for (var i = 0; i < assignTask.length; i++) {
            for (var j = 0; j < tasks.length; j++) {
                logger.debug("matched...... ", tasks[j].id);
                if (assignTask[i] === tasks[j].id) {
                    task.push(tasks[j]);
                }
            }
        }
        count = 0;

        function executeTasks(count) {
            task[count].execute(userName, baseUrl, choiceParam, function(err, taskExecuteData, history) {
                logger.debug("Calling...");
                if (err) {
                    return;
                }
                if (!(taskHistory.taskHistoryIds && taskHistory.taskHistoryIds.length)) {
                    taskHistory.taskHistoryIds = [];
                }
                taskHistory.taskHistoryIds.push({
                    taskId: task[count].id,
                    historyId: history.id
                });
                taskHistory.save();
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
                        executeTasks(count);
                    } else {
                        onComplete(null, 1);
                    }
                } else {
                    onComplete(null, 0);
                }

            });
        }

        executeTasks(count);
    });
    logger.debug(this.assignTasks);
};

var CompositeTask = mongoose.model('compositeTask', compositeTaskSchema);

module.exports = CompositeTask;