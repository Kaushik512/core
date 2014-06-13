var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	id: Number,
	name: String,
	permissions: {
		read: Boolean,
		write: Boolean,
		execute: Boolean
	}
});

var Role = mongoose.model('roles', RoleSchema);

module.exports.createRole = function(roleName, permissionsObj, callback) {
	var roles = new Role({
		id: new Date().getTime(),
		name: roleName,
		permissions: permissionsObj
	});
	roles.save(function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});

};

module.exports.getRoleById = function(roleId, callback) {
	Role.find({
		id: roleId
	}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

module.exports.getRoleByName = function(roleName, callback) {
	Role.find({
		name: roleName
	}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

module.exports.getAllRoles = function(callback) {
	Role.find({}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};