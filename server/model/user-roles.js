/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var mongoose = require('mongoose');
var logger = require('_pr/logger')(module);

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
	logger.debug('RoleID' + roleId);
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