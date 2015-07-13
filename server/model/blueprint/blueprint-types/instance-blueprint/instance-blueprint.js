var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var AWSBlueprint = require('./aws-blueprint/aws-blueprint');

var CHEFInfraBlueprint = require('./chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var CLOUD_PROVIDER_TYPE = {
    AWS: 'aws',
    AZURE: 'azure'
};

var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};


var InstanceBlueprintSchema = new Schema({
    cloudProviderType: String,
    cloudProviderId: String,
    cloudProviderData: Schema.Types.Mixed,
    infraMangerType: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed,
});

InstanceBlueprintSchema.methods.launch = function(launchOptions, infraManagerOptions, callback) {


};

// static methods
InstanceBlueprintSchema.statics.createNew = function(data) {
    var providerBlueprint;
    var providerType;
    if (data.cloudProviderType === CLOUD_PROVIDER_TYPE.AWS) {
        providerType = CLOUD_PROVIDER_TYPE.AWS;
        var providerBlueprint = AWSBlueprint.createNew({
            keyPairId: data.keyPairId,
            securityGroupIds: data.securityGroupIds,
            instanceType: data.instanceType,
            instanceAmiid: data.instanceAmiid,
            instanceUsername: data.instanceUsername,
            vpcId: data.vpcId,
            subnetId: data.subnetId,
            imageId: data.imageId,
        });
    } else if (data.cloudProviderType === CLOUD_PROVIDER_TYPE.AZURE) {
        providerType = CLOUD_PROVIDER_TYPE.AZURE;
        return null;
    } else {
        return null;
    }

    var infraManagerBlueprint;
    var infraManagerType;
    if (data.infraManagerType === INFRA_MANAGER_TYPE.CHEF) {
        infraManagerType = INFRA_MANAGER_TYPE.CHEF;
        infraManagerBlueprint = CHEFInfraBlueprint.createNew({
            runlist: data.runlist
        });

    } else if (data.infraManagerType === INFRA_MANAGER_TYPE.PUPPET) {
        infraManagerType = INFRA_MANAGER_TYPE.PUPPET;
        return null;
    }

    var self = this;
    var instanceBlueprint = new self({
        cloudProviderType: providerType,
        cloudProviderId: data.cloudProviderId,
        cloudProviderData: providerBlueprint,
        infraMangerType: infraManagerType,
        infraManagerId: data.infraManagerId,
        infraManagerData: infraManagerBlueprint,
    });


    return instanceBlueprint;
};

var InstanceBlueprint = mongoose.model('InstanceBlueprint', InstanceBlueprintSchema);

module.exports = InstanceBlueprint;