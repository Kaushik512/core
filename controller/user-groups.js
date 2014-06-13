var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GroupSchema = new Schema({
	id: Number,
	name: String
});

var Group = mongoose.model('groups', GroupSchema);

module.exports.createGroup = function(groupName, callback) {
	var group = new Group({
		id: new Date().getTime(),
		name: groupName
	});
	group.save(function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});

};

module.exports.getGroupById = function(groupId, callback) {
	Group.find({
		id: groupId
	}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

module.exports.getGroupByName = function(groupName, callback) {
	Group.find({
		name: groupName
	}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

module.exports.getAllGroups = function(callback) {
	Group.find({}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};