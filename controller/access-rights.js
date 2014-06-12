var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RolesSchema = new Schema({
	id: Number,
	name: String,
	permissions: {
		read: Boolean,
		wright: Boolean,
		execute: Boolean
	}
});

var Roles = mongoose.model('roles', RolesSchema);

module.exports.createRole = function(roleName, permissionsObj, callback) {
	roles = new Roles({
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
	Roles.find({
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
	Roles.find({
		id: roleName
	}, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};