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

InstanceBlueprintSchema.methods.launch = function(version, callback) {
    cloudProviderConfig = getCloudProviderConfigType(this);
    cloudProviderConfig.launch(version, callback);
};

InstanceBlueprintSchema.methods.update = function(updateData) {
    infraManagerConfig = getInfraManagerConfigType(this);
    infraManagerConfig.update(updateData);
    this.infraManagerData = infraManagerConfig;
};

InstanceBlueprintSchema.methods.getVersionData = function(ver) {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getVersionData(ver);

};

InstanceBlueprintSchema.methods.getLatestVersion = function() {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getLatestVersion();

};

InstanceBlueprintSchema.methods.getInfraManagerData = function() {
    return {
        infraMangerType: this.infraManagerType,
        infraManagerId: this.infraManagerId,
        infraManagerData: this.infraManagerData
    };
};

InstanceBlueprintSchema.methods.getCloudProviderData = function() {
    return {
        cloudProviderType: this.cloudProviderType,
        cloudProviderId: this.cloudProviderId,
        cloudProviderData: this.cloudProviderData
    };
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
            instanceOS: data.instanceOS,
            instanceCount: data.instanceCount
        });
    } else if (data.cloudProviderType === CLOUD_PROVIDER_TYPE.AZURE) {
        providerType = CLOUD_PROVIDER_TYPE.AZURE;

        var providerBlueprint = AWSBlueprint.createNew({
            securityGroupIds: data.securityGroupIds,
            instanceType: data.instanceType,
            instanceAmiid: data.instanceAmiid,
            instanceUsername: data.instanceUsername,
            vpcId: data.vpcId,
            subnetId: data.subnetId,
            imageId: data.imageId,
            instanceOS: data.instanceOS,
            instanceCount: data.instanceCount
        });

        //return null;
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