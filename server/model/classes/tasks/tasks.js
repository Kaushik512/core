var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var ChefTask = require('./taskTypeChef');
var JenkinsTask = require('./taskTypeJenkins');

var TaskHistory = require('./taskHistory');


var Schema = mongoose.Schema;

var TASK_TYPE = {
    CHEF_TASK: 'chef',
    JENKINS_TASK: 'jenkins'
};

var TASK_STATUS = {
    SUCCESS: 'success',
    RUNNING: 'running',
    FAILED: 'failed'
};


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
    description: {
        type: String
    },
    taskConfig: Schema.Types.Mixed,
    lastTaskStatus: String,
    lastRunTimestamp: Number,
    timestampEnded: Number
});

// instance method :-  

// Executes a task
taskSchema.methods.execute = function(userName, baseUrl, callback, onComplete) {
    logger.debug('Executing');
    var task;
    var self = this;

    var taskHistoryData = {
        taskId: self._id,
        taskType: self.taskType,
        user: userName
    };

    if (this.taskType === TASK_TYPE.CHEF_TASK) {
        task = new ChefTask(this.taskConfig);

        taskHistoryData.nodeIds = this.taskConfig.nodeIds;
        taskHistoryData.runlist = this.taskConfig.runlist;
        taskHistoryData.attributes = this.taskConfig.attributes;

    } else if (this.taskType === TASK_TYPE.JENKINS_TASK) {
        task = new JenkinsTask(this.taskConfig);
        taskHistoryData.jenkinsServerId = this.taskConfig.jenkinsServerId;
        taskHistoryData.jobName = this.taskConfig.jobName;


    } else {
        callback({
            message: "Invalid Task Type"
        }, null);
        return;
    }
    var timestamp = new Date().getTime();
    var taskHistory = null;
    task.execute(userName, baseUrl, function(err, taskExecuteData) {
        if (err) {
            callback(err, null);
            return;
        }
        self.lastRunTimestamp = timestamp;
        self.lastTaskStatus = TASK_STATUS.RUNNING;
        self.save(function(err, data) {
            if (err) {
                logger.error("Unable to update task timestamp");
                return;
            }
            logger.debug("Task last run timestamp updated",JSON.stringify(data));
            taskHistoryData.jobResultURL = data.taskConfig.jobResultURL;
        });

        if (!taskExecuteData) {
            taskExecuteData = {};
        }
        taskExecuteData.timestamp = timestamp;
        taskExecuteData.taskType = task.taskType;


        //making task history entry
        if (taskExecuteData.instances) {
            taskHistoryData.nodeIdsWithActionLog = [];
            for (var i = 0; i < taskExecuteData.instances.length; i++) {
                var obj = {
                    nodeId: taskExecuteData.instances[i]._id,
                    actionLogId: taskExecuteData.instances[i].tempActionLogId
                }
                taskHistoryData.nodeIdsWithActionLog.push(obj);
            }
        }

        taskHistoryData.status = TASK_STATUS.RUNNING;
        taskHistoryData.timestampStarted = timestamp;
        if (taskExecuteData.buildNumber) {
            taskHistoryData.buildNumber = taskExecuteData.buildNumber;
        }
        TaskHistory.createNew(taskHistoryData, function(err, taskHistoryEntry) {
            if (err) {
                logger.error("Unable to make task history entry", err);
                return;
            }
            taskHistory = taskHistoryEntry;
            logger.debug("Task history created");
        });

        callback(null, taskExecuteData);
    }, function(err, status, resultData) {
        self.timestampEnded = new Date().getTime();
        if (status == 0) {
            self.lastTaskStatus = TASK_STATUS.SUCCESS;
        } else {
            self.lastTaskStatus = TASK_STATUS.FAILED;
        }
        self.save();

        //updating task history
        if (taskHistory) {
            taskHistory.timestampEnded = self.timestampEnded;
            taskHistory.status = self.lastTaskStatus;
            if (resultData && resultData.instancesResults && resultData.instancesResults.length) {
                taskHistory.executionResults = resultData.instancesResults;
            }
            taskHistory.save();
        }

        if (typeof onComplete === 'function') {
            onComplete(err, status);
        }
    });
};

// Get Nodes list
taskSchema.methods.getChefTaskNodes = function() {
    if (this.taskType === TASK_TYPE.CHEF_TASK) {
        var chefTask = new ChefTask(this.taskConfig);
        return chefTask.getNodes();
    } else {
        return [];
    }
};

taskSchema.methods.getHistory = function(callback) {
    TaskHistory.getHistoryByTaskId(this.id, function(err, tHistories) {
        callback(err, tHistories);
    });
};





// Static methods :- 

// creates a new task
taskSchema.statics.createNew = function(taskData, callback) {

    var taskConfig;
    if (taskData.taskType === TASK_TYPE.JENKINS_TASK) {
        taskConfig = new JenkinsTask({
            taskType: TASK_TYPE.JENKINS_TASK,
            jenkinsServerId: taskData.jenkinsServerId,
            jobName: taskData.jobName,
            jobResultURL: taskData.jobResultURL,
            jobURL: taskData.jobURL,
            autoSyncFlag: taskData.autoSyncFlag,
            isParameterized: taskData.isParameterized,
            parameterized: taskData.parameterized
        });
    } else if (taskData.taskType === TASK_TYPE.CHEF_TASK) {
        var attrJson = null;

        taskConfig = new ChefTask({
            taskType: TASK_TYPE.CHEF_TASK,
            nodeIds: taskData.nodeIds,
            runlist: taskData.runlist,
            attributes: taskData.attributes
        });
    } else {
        callback({
            message: "Invalid Task Type"
        }, null);
        return;
    }
    var taskObj = taskData;
    taskObj.taskConfig = taskConfig;

    var that = this;
    var task = new that(taskObj);
    logger.debug('saved task:' + JSON.stringify(task));

    task.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, task);
    });
};

// creates a new task
taskSchema.statics.getTasksByOrgBgProjectAndEnvId = function(orgId, bgId, projectId, envId, callback) {
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projectId,
        envId: envId
    }

    this.find(queryObj, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};

// get task by id
taskSchema.statics.getTaskById = function(taskId, callback) {
    this.find({
        "_id": new ObjectId(taskId)
    }, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        //console.log('data ==>', data);
        if (data.length) {
            callback(null, data[0]);
        } else {
            callback(null, null);
        }

    });
};

// get task by ids
taskSchema.statics.getTaskByIds = function(taskIds, callback) {
    if (!(taskIds && taskIds.length)) {
        callback(null, []);
        return;
    }
    var queryObj = {};
    queryObj._id = {
        $in: taskIds
    }
    console.log(taskIds);
    this.find(queryObj, function(err, tasks) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, tasks);
    });
};


// remove task by id
taskSchema.statics.removeTaskById = function(taskId, callback) {
    this.remove({
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


// update tasks by id
taskSchema.statics.updateTaskById = function(taskId, taskData, callback) {
    var taskConfig;

    if (taskData.taskType === TASK_TYPE.JENKINS_TASK) {
        taskConfig = new JenkinsTask({
            taskType: TASK_TYPE.JENKINS_TASK,
            jenkinsServerId: taskData.jenkinsServerId,
            jobName: taskData.jobName,
            jobResultURL: taskData.jobResultURL,
            jobURL: taskData.jobURL,
            autoSyncFlag: taskData.autoSyncFlag,
            isParameterized: taskData.isParameterized,
            parameterized: taskData.parameterized
        });
    } else if (taskData.taskType === TASK_TYPE.CHEF_TASK) {

        taskConfig = new ChefTask({
            taskType: TASK_TYPE.CHEF_TASK,
            nodeIds: taskData.nodeIds,
            runlist: taskData.runlist,
            attributes: taskData.attributes
        });
    } else {
        callback({
            message: "Invalid Task Type"
        }, null);
        return;
    }

    Tasks.update({
        "_id": new ObjectId(taskId)
    }, {
        $set: {
            name: taskData.name,
            taskConfig: taskConfig,
            taskType: taskData.taskType,
            description: taskData.description
        }
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            callback(err, null);
            return;
        }
        //console.log('data ==>', data);
        logger.debug('Updated task:' + JSON.stringify(Tasks));
        callback(null, updateCount);

    });

};

taskSchema.statics.getTasksByNodeIds = function(nodeIds, callback) {
    if (!nodeIds) {
        nodeIds = [];
    }
    console.log("nodeids ==> ", nodeIds,typeof nodeIds[0]);
    Tasks.find({
        "taskConfig.nodeIds": {
            "$in": nodeIds
        }
    }, function(err, tasks) {
        if (err) {
            callback(err, null);
            return;
        }
        //console.log('data ==>', data);
        callback(null, tasks);

    });
};


var Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;