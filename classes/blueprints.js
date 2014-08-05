var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var BlueprintSchema = new Schema({
	projectId: String,
	envId: String,
	name: String,
	templateId: String,
	templateType: String,

	versionsList: [{
		ver: String,
		runlist: [String],
		expirationDays: Number,
	}],
	latestVersion: String,
	cloudFormationStackName: String,
	cloudFormationStackParameters: [{
		ParameterKey: String,
		ParameterValue: String
	}]

});

var Blueprint = mongoose.model('blueprints', BlueprintSchema);

function generateBlueprintVersionNumber(prevVersion) {
	if (!prevVersion) {
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

	return major + '.' + minor;
}

var BlueprintsDao = function() {

	this.getBlueprintById = function(blueprintId, callback) {
		console.log(blueprintId);
		Blueprint.find({
			"_id": new ObjectId(blueprintId)
		}, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log('data ==>', data);
			callback(null, data);

		});
	}

	this.getBlueprintsByProjectAndEnvId = function(projectId, envId, blueprintType, callback) {
		var queryObj = {
			projectId: projectId,
			envId: envId
		}
		if (blueprintType) {
           queryObj.templateType = blueprintType;
		}
		Blueprint.find(queryObj, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			callback(null, data);
		});
	};

	this.createBlueprint = function(blueprintData, callback) {
		var blueprint = new Blueprint({
			projectId: blueprintData.projectId,
			envId: blueprintData.envId,
			name: blueprintData.name,
			templateId: blueprintData.templateId,
			templateType: blueprintData.templateType,
			versionsList: [{
				ver: generateBlueprintVersionNumber(null),
				runlist: blueprintData.runlist,
				expirationDays: blueprintData.expirationDays,
			}],
			latestVersion: generateBlueprintVersionNumber(null),
			cloudFormationStackName: blueprintData.cloudFormationStackName,
			cloudFormationStackParameters: blueprintData.cloudFormationStackParameters
		});

		blueprint.save(function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log("Blueprint Created");
			callback(null, data);
		});
	};

	this.updateBlueprint = function(blueprintId, updateData, callback) {
		this.getBlueprintById(blueprintId, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			if (data.length) {
				console.log('updating');
				var latestVersion = data[0].latestVersion;
				var newVersion = generateBlueprintVersionNumber(latestVersion);
				Blueprint.update({
					"_id": new ObjectId(blueprintId)
				}, {
					$set: {
						latestVersion: newVersion
					},
					$push: {
						versionsList: {
							ver: newVersion,
							runlist: updateData.runlist,
							expirationDays: updateData.expirationDays,
						}
					}
				}, {
					upsert: false
				}, function(err, updatedData) {
					if (err) {
						callback(err, null);
						return;
					}
					callback(null, updatedData);
				});
			} else {
				callback(null, 0);
			}
		});
	}
}

module.exports = new BlueprintsDao();