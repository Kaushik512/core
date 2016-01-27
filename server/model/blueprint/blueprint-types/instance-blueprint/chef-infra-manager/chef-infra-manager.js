/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var InstanceChefInfraManagerSchema = new Schema({
	versionsList: [{
		ver: {
			type: String,
			required: true
		},
		runlist: [{
			type: String,
			required: true
		}]
	}],
	latestVersion: {
		type: String,
		trim: true
	}
});


function generateBlueprintVersionNumber(prevVersion) {
	logger.debug("Enter generateBlueprintVersionNumber()", prevVersion);
	if (!prevVersion) {
		logger.warn("No prevVersion provided. Returning 0.1");
		return "0.1";
	}

	var parts = prevVersion.split('.');
	var major = parseInt(parts[0]);
	var minor = parseInt(parts[1]);
	minor++;

	if (minor === 10) {
		major++;
		minor = 0;
	}
	logger.debug("Exit generateBlueprintVersionNumber(%s) = %s.%s", prevVersion, major, minor);
	return major + '.' + minor;
}
// instance method 

InstanceChefInfraManagerSchema.methods.update = function(updateData) {
	var ver = generateBlueprintVersionNumber(this.latestVersion);
	this.versionsList.push({
		ver: ver,
		runlist: updateData.runlist
	});
	this.latestVersion = ver;
};

InstanceChefInfraManagerSchema.methods.getVersionData = function(ver) {
	if (ver) {
		for (var i = 0; i < this.versionsList.length; i++) {
			if (this.versionsList[i].ver === ver) {
				return this.versionsList[i];
			}
		}
	} else {
        return this.getLatestVersion();
    }
};

InstanceChefInfraManagerSchema.methods.getLatestVersion = function() {
	if (!this.versionsList.length) {
		return null;
	}
	return this.versionsList[this.versionsList.length - 1];
};

InstanceChefInfraManagerSchema.statics.createNew = function(chefData) {
	var self = this;

	var chefInfraManager = new self({
		versionsList: [{
			ver: generateBlueprintVersionNumber(null),
			runlist: chefData.runlist
		}],
		latestVersion: generateBlueprintVersionNumber(null)
	});
	return chefInfraManager;
};

var InstanceChefInfraManager = mongoose.model('instanceChefInfraManager', InstanceChefInfraManagerSchema);

module.exports = InstanceChefInfraManager;