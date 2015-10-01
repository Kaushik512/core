var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var CHEFInfraBlueprint = require('../chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var CLOUD_PROVIDER_TYPE = {
    AWS: 'aws',
    AZURE: 'azure'
};

var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};

var azureInstanceBlueprintSchema = new Schema({
    cloudProviderType: {
        type: String,
        required: true,
        trim: true
    },
    cloudProviderId: {
        type: String,
        required: true,
        trim: true
    },
    subnetId: {
        type: String,
        required: true,
        trim: true
    },
    vpcId: {
        type: String,
        required: true,
        trim: true
    },
    region: {
        type: String,
        required: true,
        trim: true
    },
    securityGroupIds: {
        type: String,
        required: true,
        trim: true
    },
    instanceType: {
        type: String,
        //  required: true
    },
    instanceOS: {
        type: String,
        // required: true
    },
    instanceCount:{
        type: String,
    },
    instanceAmiid: {
        type: String,
        //  required: true
    },
    imageId: {
        type: String,
        required: true
    },
    infraMangerType: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed
});

azureInstanceBlueprintSchema.methods.launch = function(ver, callback) {


};


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

function getCloudProviderConfigType(blueprint) {
    var CloudProviderConfig;
    if (blueprint.cloudProviderType === CLOUD_PROVIDER_TYPE.AWS) {
        CloudProviderConfig = AWSBlueprint;
    } else if (blueprint.infraMangerType === CLOUD_PROVIDER_TYPE.azure) {
        return null;
    } else {
        return null;
    }
    var cloudProviderConfig = new CloudProviderConfig(blueprint.cloudProviderData);
    return cloudProviderConfig;
}

azureInstanceBlueprintSchema.methods.launch = function(version, callback) {
    cloudProviderConfig = getCloudProviderConfigType(this);
    cloudProviderConfig.launch(version, callback);
};

azureInstanceBlueprintSchema.methods.update = function(updateData) {
    infraManagerConfig = getInfraManagerConfigType(this);
    infraManagerConfig.update(updateData);
    this.infraManagerData = infraManagerConfig;
};

azureInstanceBlueprintSchema.methods.getVersionData = function(ver) {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getVersionData(ver);

};

azureInstanceBlueprintSchema.methods.getLatestVersion = function() {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getLatestVersion();

};

azureInstanceBlueprintSchema.methods.getInfraManagerData = function() {
    return {
        infraMangerType: this.infraManagerType,
        infraManagerId: this.infraManagerId,
        infraManagerData: this.infraManagerData
    };
};

azureInstanceBlueprintSchema.methods.getCloudProviderData = function() {
    return {
        cloudProviderType: this.cloudProviderType,
        cloudProviderId: this.cloudProviderId,
        cloudProviderData: this.cloudProviderData
    };
};

azureInstanceBlueprintSchema.statics.createNew = function(data) {
    var self = this;
    logger.debug('In azureInstanceBlueprintSchema createNew');
   
    var infraManagerBlueprint = CHEFInfraBlueprint.createNew({
            runlist: data.runlist
        });

    logger.debug(JSON.stringify(data));

    var azureInstanceBlueprint = new self({
        cloudProviderType: data.cloudProviderType,
        cloudProviderId: data.cloudProviderId,
        securityGroupIds: data.securityGroupIds,
        instanceType: data.instanceType,
        instanceAmiid: data.instanceAmiid,
        vpcId: data.vpcId,
        region: data.region,
        subnetId: data.subnetId,
        imageId: data.imageId,
        instanceOS: data.instanceOS,
        instanceCount: data.instanceCount,
        infraMangerType: data.infraManagerType,
        infraManagerId: data.infraManagerId,
        infraManagerData: infraManagerBlueprint
    });

    return azureInstanceBlueprint;
};

var azureInstanceBlueprint = mongoose.model('azureInstanceBlueprint', azureInstanceBlueprintSchema);

module.exports = azureInstanceBlueprint;