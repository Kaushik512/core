/*
Copyright [2016] [Gobinda Das]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
var CHEFInfraBlueprint = require('../chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var CLOUD_PROVIDER_TYPE = {
    AWS: 'aws',
    AZURE: 'azure',
    VMWARE: 'vmware'
};

var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};

var vmwareInstanceBlueprintSchema = new Schema({
    imageId: {
        type: String,
        trim: true
    },
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
    network: {
        type: String,

        trim: true
    },

    securityGroupIds: {
        type: [String],

        trim: true
    },

    dataStore: {
        type: String,
        trim: true
    },
    subnet: {
        type: String,

        trim: true
    },
    instanceOS: {
        type: String,
        // required: true
    },
    instanceCount: {
        type: String,
    },
    instanceImageName: {
        type: String,
        //  required: true
    },
    instanceUsername: {
        type: String
            //required: true
    },
    infraMangerType: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed,
    cloudProviderData: Schema.Types.Mixed
});

vmwareInstanceBlueprintSchema.methods.launch = function(ver, callback) {


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
    } else if (blueprint.infraMangerType === CLOUD_PROVIDER_TYPE.vmware) {
        CloudProviderConfig = vmwareBlueprint;
    } else {
        return null;
    }
    var cloudProviderConfig = new CloudProviderConfig(blueprint.cloudProviderData);
    return cloudProviderConfig;
}

vmwareInstanceBlueprintSchema.methods.launch = function(version, callback) {
    cloudProviderConfig = getCloudProviderConfigType(this);
    cloudProviderConfig.launch(version, callback);
};

vmwareInstanceBlueprintSchema.methods.update = function(updateData) {
    infraManagerConfig = getInfraManagerConfigType(this);
    infraManagerConfig.update(updateData);
    this.infraManagerData = infraManagerConfig;
};

vmwareInstanceBlueprintSchema.methods.getVersionData = function(ver) {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getVersionData(ver);

};

vmwareInstanceBlueprintSchema.methods.getLatestVersion = function() {
    infraManagerConfig = getInfraManagerConfigType(this);
    return infraManagerConfig.getLatestVersion();

};

vmwareInstanceBlueprintSchema.methods.getInfraManagerData = function() {
    return {
        infraMangerType: this.infraManagerType,
        infraManagerId: this.infraManagerId,
        infraManagerData: this.infraManagerData
    };
};

vmwareInstanceBlueprintSchema.methods.getCloudProviderData = function() {
    return {
        cloudProviderType: this.cloudProviderType,
        cloudProviderId: this.cloudProviderId,
        cloudProviderData: this.cloudProviderData
    };
};

// static methods
vmwareInstanceBlueprintSchema.statics.createNew = function(awsData) {
    var self = this;
    logger.debug('In vmwareInstanceBlueprintSchema createNew');


    var infraManagerBlueprint = CHEFInfraBlueprint.createNew({
        runlist: awsData.runlist
    });
    awsData.infraManagerData = infraManagerBlueprint;
    awsData.infraMangerType = "chef";
    awsData.infraManagerId = awsData.infraManagerId;
    awsData.dataStore = awsData.dataStore;
    awsData.imageId = awsData.imageId;
    logger.debug(awsData);
    awsData.cloudProviderData = {
        instanceCount: awsData.instanceCount,
        instanceOS: awsData.instanceOS,
        imageId: awsData.imageId,
        dataStore: awsData.dataStore,
        cloudProviderType: awsData.cloudProviderType
    };
    var awsInstanceBlueprint = new self(awsData);

    return awsInstanceBlueprint;
};

var vmwareInstanceBlueprint = mongoose.model('vmwareInstanceBlueprint', vmwareInstanceBlueprintSchema);

module.exports = vmwareInstanceBlueprint;
