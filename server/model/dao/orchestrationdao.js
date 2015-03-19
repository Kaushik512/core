var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('./schema-validator');
var uniqueValidator = require('mongoose-unique-validator');


var TASK_TYPE = {
    CHEF_TASK: 'chef',
    JENKINS_TASK: 'jenkins'
}

var Schema = mongoose.Schema;

var taskSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
    },
    bgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.bgIdValidator
    },
    projectId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.projIdValidator
    },
    envId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.envIdValidator
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.taskNameValidator
    },
    taskType: {
        type: String,
        required: true,
        trim: true
    },
    chefTask: {
        nodesIdList: [String],
        runlist: [String]
    },
    jenkinsTask: {
        jenkinsServerId: String,
        jobName: String,
        users: [String]
    },
    running: Boolean,
    lastRunTimestamp: Number,
});

var Tasks = mongoose.model('Tasksasas', taskSchema);

var TaskDao = function() {

    this.getTasksByOrgProjectAndEnvId = function(orgId, projectId, envId, callback) {
        var queryObj = {
            orgId: orgId,
            projectId: projectId,
            envId: envId
        }

        Tasks.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getTasksByOrgBgProjectAndEnvId = function(orgId, bgId, projectId, envId, callback) {
        var queryObj = {
            orgId: orgId,
            bgId: bgId,
            projectId: projectId,
            envId: envId
        }

        Tasks.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.createTask = function(taskData, callback) {
        var taskObj = {
            orgId: taskData.orgId,
            bgId: taskData.bgId,
            projectId: taskData.projectId,
            envId: taskData.envId,
        };

        if (taskData.taskType === TASK_TYPE.CHEF_TASK) {
            taskObj.taskType = TASK_TYPE.CHEF_TASK;
            taskObj.chefTask = {
                nodesIdList: taskData.nodesIdList,
                runlist: taskData.runlist,
            }
        } else if (taskData.taskType === TASK_TYPE.JENKINS_TASK) {
            taskObj.taskType = TASK_TYPE.JENKINS_TASK;
            taskObj.jenkinsTask = {
                jenkinsServerId: taskData.jenkinsServerId,
                jobName: taskData.jobName,
                users: taskData.users
            }
        } else {
            callback({
                error: 'Invalid Task Type'
            }, null);
            return;
        }

        taskObj.name = taskData.name;

        var task = new Tasks(taskObj);

        task.save(function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log("task Created");
            callback(null, data);
        });
    }

    this.getTaskById = function(taskId, callback) {
        Tasks.find({
            "_id": new ObjectId(taskId)
        }, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            //console.log('data ==>', data);
            callback(null, data);
        });
    }


    this.removeTaskById = function(taskId, callback) {
        Tasks.remove({
            "_id": new ObjectId(taskId)
        }, function(err, deleteCount) {
            if (err) {
                callback(err, null);
                return;
            }
            //console.log('data ==>', data);
            callback(null, deleteCount);

        });
    };

    this.updateLastRunTimeStamp = function(taskId, timestamp, callback) {
        Tasks.update({
            "_id": new ObjectId(taskId)
        }, {
            $set: {
                lastRunTimestamp: timestamp
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                callback(err, null);
                return;
            }
            //console.log('data ==>', data);
            callback(null, updateCount);

        });

    };

    this.updateTaskRunningState = function(taskId, running, callback) {
        Tasks.update({
            "_id": new ObjectId(taskId)
        }, {
            $set: {
                running: running
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }
            //console.log('data ==>', data);
            if (typeof callback === 'function') {
                callback(null, updateCount);
            }
        });
    };




    this.updateTaskData = function(taskId, taskData, callback) {
        var chefTask = {};
        var jenkinsTask = {};
        var taskType = null;
        if (taskData.taskType === TASK_TYPE.CHEF_TASK) {
            taskType = TASK_TYPE.chefTask;
            chefTask = {
                nodesIdList: taskData.nodesIdList,
                runlist: taskData.runlist,
            }
        } else if (taskData.taskType === TASK_TYPE.JENKINS_TASK) {
            taskType = TASK_TYPE.JENKINS_TASK;
            jenkinsTask = {
                jenkinsServerId: taskData.jenkinsServerId,
                jobName: taskData.jobName,
                users: taskData.users
            }
        } else {
            callback({
                error: 'Invalid Task Type'
            }, null);
            return;
        }

        Tasks.update({
            "_id": new ObjectId(taskId)
        }, {
            $set: {
                name: taskData.name,
                jenkinsTask: jenkinsTask,
                chefTask: chefTask,
                taskType: taskType
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                callback(err, null);
                return;
            }
            //console.log('data ==>', data);
            callback(null, updateCount);

        });

    };

    this.getTaskTypes = function() {
        return TASK_TYPE;
    }

}

module.exports = new TaskDao();