var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var taskSchema = new Schema({
    orgId: {type:String,required:true},
    projectId: {type:String,required:true},
    envId: {type:String,required:true},
    name: {type:String,required:true},
    nodesIdList: [String],
    runlist: [String],
    lastRunTimestamp: Number,
});

var Tasks = mongoose.model('Tasks', taskSchema);

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


    this.createTask = function(TaskData, callback) {
        var task = new Tasks(TaskData);

        task.save(function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log("task Created");
            callback(null, data);
        });
    };

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

    this.updateTaskData = function(taskId, taskData, callback) {
        Tasks.update({
            "_id": new ObjectId(taskId)
        }, {
            $set: {
                name: taskData.name,
                nodesIdList: taskData.nodesIdList,
                runlist: taskData.runlist,
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

}

module.exports = new TaskDao();