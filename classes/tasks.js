var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var taskSchema = new Schema({
    orgId: String,
    projectId: String,
    envId: String,
    name: String,
    nodesIdList: [String],
    runlist: [String],
    lastRun: Number,
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
        var task = new Instances(TaskData);

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
        console.log(instanceId);
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

}

module.exports = new TaskDao();
