var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var ChefTask = require('./taskTypeChef');
var JenkinsTask = require('./taskTypeJenkins');

var Schema = mongoose.Schema;

var TASK_TYPE = {
    CHEF_TASK: 'chef',
    JENKINS_TASK: 'jenkins'
}



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
    taskConfig: Schema.Types.Mixed,
    running: Boolean,
    lastRunTimestamp: Number,
});

// instance method :-  

// Executes a task
taskSchema.methods.execute = function(taskData, callback) {

};

// Get Nodes list
taskSchema.methods.getChefTaskNodes = function() {
    if(this.taskType === TASK_TYPE.CHEF_TASK) {
        var chefTask = new ChefTask(this.taskConfig); 
        return chefTask.getNodes();
    } else {
        return null;
    }    
};




// Static methods :- 

// creates a new task
taskSchema.statics.createNew = function(taskData, callback) {
    var taskConfig;
    if (taskData.taskType === TASK_TYPE.JENKINS_TASK) {
        taskConfig = new JenkinsTask({
            taskType: TASK_TYPE.JENKINS_TASK,
            jenkinsServerId: taskData.jenkinsServerId,
            jobName: taskData.jobName
        });
    } else if (taskData.taskType === TASK_TYPE.CHEF_TASK) {
        taskConfig = new ChefTask({
            taskType: TASK_TYPE.CHEF_TASK,
            nodeIds: taskData.nodeIds,
            runlist: taskData.runlist
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
        callback(null, data);
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
            jobName: taskData.jobName
        });
    } else if (taskData.taskType === TASK_TYPE.CHEF_TASK) {
        taskConfig = new ChefTask({
            taskType: TASK_TYPE.CHEF_TASK,
            nodeIds: taskData.nodeIds,
            runlist: taskData.runlist
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
            taskType: taskData.taskType
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


var Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;