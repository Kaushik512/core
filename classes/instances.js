var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var InstanceSchema = new Schema({
	projectId: String,
	envId: String,
	chefNodeName: String,
	runlist: [String],
	platformId: String,
	instanceIP: String,
	instanceState: String,
	bootStrapStatus: String,
	logs: [{
		err: Boolean,
		log: String,
		timestamp: Number
	}],
	blueprintData: {
		blueprintId: String,
		blueprintName: String,
		templateId: String,
		templateType: String,
		templateComponents: [String]
	}
});

var Instances = mongoose.model('instances', InstanceSchema);

var InstancesDao = function() {

	this.getInstanceById = function(instanceId, callback) {
		console.log(instanceId);
		Instances.find({
			"_id": new ObjectId(instanceId)
		}, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log('data ==>', data);
			callback(null, data);

		});
	}

	this.getInstancesByProjectAndEnvId = function(projectId, envId, instanceType, callback) {
		var queryObj = {
			projectId: projectId,
			envId: envId
		}
		if (instanceType) {
			queryObj['blueprintData.templateType'] = instanceType;
		}
		Instances.find(queryObj, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			callback(null, data);
		});
	};

	this.createInstance = function(instanceData, callback) {
		var instance = new Instances(instanceData);

		instance.save(function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log("Instance Created");
			callback(null, data);
		});
	};

	this.updateInstanceIp = function(instanceId, ipaddress, callback) {
		Instances.update({
			"_id": new ObjectId(instanceId),
		}, {
			$set: {
				"instanceIP": ipaddress
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

	this.updateInstanceState = function(instanceId, state, callback) {
		Instances.update({
			"_id": new ObjectId(instanceId),
		}, {
			$set: {
				"instanceState": state
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

	this.updateInstanceBootstrapStatus = function(instanceId, status, callback) {
		Instances.update({
			"_id": new ObjectId(instanceId),
		}, {
			$set: {
				"bootStrapStatus": status
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



	this.updateInstanceLog = function(instanceId, log, callback) {
		Instances.update({
			"_id": new ObjectId(instanceId),
		}, {
			$push: {
				"logs": log
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

	this.updateInstancesRunlist = function(instanceId, runlist, callback) {

		Instances.update({
			"_id": new ObjectId(instanceId),
		}, {
			$set: {
				"runlist": runlist
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

	}
}

module.exports = new InstancesDao();