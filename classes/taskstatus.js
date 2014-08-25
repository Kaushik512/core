var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var TaskStatusSchema = new Schema({
	timeStarted: Number,
	timeEnded: Number,
	completed: boolean,
	status: Object
});

var TaskStatus = mongoose.model('taskstatus', TaskStatusSchema);

var TaskStatusDao = function() {

	this.getTaskStatusById = function(taskId, callback) {
		console.log(taskId);
		TaskStatus.find({
			"_id": new ObjectId(taskId)
		}, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log('data ==>', data);
			callback(null, data);

		});
	},

	this.createTaskStatus = function(taskStatusData, callback) {
		var taskStatus = new TaskStatus(taskStatusData);

		taskStatus.save(function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			callback(null, data);
		});
	};

	this.updateTaskStatus = function(instanceId, statusObj, callback) {
		TaskStatus.update({
			"_id": new ObjectId(instanceId),
		}, {
			$set: {
				"timeEnded": statusObj.timeEnded,
				"completed": statusObj.completed,
				"status": statusObj.status
			}
		}, {
			upsert: false
		}, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			callback(null, data);
		});
	};
};

module.exports = new TaskStatusDao();