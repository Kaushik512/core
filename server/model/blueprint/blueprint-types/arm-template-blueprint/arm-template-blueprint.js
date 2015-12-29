var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var CHEFInfraBlueprint = require('./chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var INFRA_MANAGER_TYPE = {
	CHEF: 'chef',
	PUPPET: 'puppet'
};


var ARMTemplateBlueprintSchema = new Schema({
	cloudProviderId: String,
	infraMangerType: String,
	infraManagerId: String,
	templateFile: String,
	parameters: Object,
	instances: Object,
	//stackName: String,
	resourceGroup: String,
});

function getInfraManagerConfigType(blueprint) {
	var InfraManagerConfig;
	if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.CHEF) {
		InfraManagerConfig = CHEFInfraBlueprint;
	} else if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.PUPPET) {
		return null;
	} else {
		return null;
	}
	var infraManagerConfig = new InfraManagerConfig(blueprint.infraManagerData);
	return infraManagerConfig;
}

ARMTemplateBlueprintSchema.methods.launch = function(launchOptions, infraManagerOptions, callback) {


};

ARMTemplateBlueprintSchema.methods.update = function(updateData) {
	// infraManagerConfig = getInfraManagerConfigType(this);
	// infraManagerConfig.update(updateData);
	// this.infraManagerData = infraManagerConfig;

};


ARMTemplateBlueprintSchema.methods.getVersionData = function(ver) {
	// infraManagerConfig = getInfraManagerConfigType(this);
	// return infraManagerConfig.getVersionData(ver);
	return null;
};



ARMTemplateBlueprintSchema.methods.getLatestVersion = function() {
	// infraManagerConfig = getInfraManagerConfigType(this);
	// return infraManagerConfig.getLatestVersion();
	return null;
};



ARMTemplateBlueprintSchema.methods.getCloudProviderData = function() {
	return {
		cloudProviderId: this.cloudProviderId
	};

}

ARMTemplateBlueprintSchema.methods.getInfraManagerData = function() {
	return {
		infraMangerType: this.infraManagerType,
		infraManagerId: this.infraManagerId
			//   infraManagerData: this.infraManagerData
	};
};


// static methods
ARMTemplateBlueprintSchema.statics.createNew = function(data) {


	var infraManagerBlueprint;
	var infraManagerType;
	if (data.infraManagerType === INFRA_MANAGER_TYPE.CHEF) {
		infraManagerType = INFRA_MANAGER_TYPE.CHEF;
		// infraManagerBlueprint = CHEFInfraBlueprint.createNew({
		//     runlist: data.runlist
		// });

	} else if (data.infraManagerType === INFRA_MANAGER_TYPE.PUPPET) {
		infraManagerType = INFRA_MANAGER_TYPE.PUPPET;
		return null;
	}
	var parameters = {};
	console.log('parameters ===>  ', data.stackParameters);
	if (data.stackParameters) {
		for (var i = 0; i < data.stackParameters.length; i++) {

			parameters[data.stackParameters[i].ParameterKey] = {};

			var value = data.stackParameters[i].ParameterValue;
			if (data.stackParameters[i].type === 'int') {
				value = parseFloat(data.stackParameters[i].ParameterValue);
			}
			parameters[data.stackParameters[i].ParameterKey].value = value;
		}

	}

	var self = this;
	var cftBlueprint = new self({
		cloudProviderId: data.cloudProviderId,
		infraMangerType: infraManagerType,
		infraManagerId: data.infraManagerId,
		/*infraManagerData: infraManagerBlueprint,*/
		parameters: parameters,
		//stackName: data.stackName,
		templateFile: data.templateFile,
		resourceGroup: data.resourceGroup,
		instances: data.instances
			// instanceUsername: data.instanceUsername
	});


	return cftBlueprint;
};



var ARMTemplateBlueprint = mongoose.model('ARMTemplateBlueprint', ARMTemplateBlueprintSchema);

module.exports = ARMTemplateBlueprint;