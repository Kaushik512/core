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

var CHEFInfraBlueprint = require('./chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};


var CloudFormationBlueprintSchema = new Schema({
    cloudProviderId: String,
    infraMangerType: String,
    infraManagerId: String,
    templateFile: String,
    stackParameters: [{
        _id: false,
        ParameterKey: {
            type: String,
            trim: true
        },
        ParameterValue: {
            type: String,
            trim: true
        }
    }],
    instances: [{
        _id: false,
        logicalId: String,
        username: String,
        runlist: [String]
    }],
    //stackName: String,
    templateFile: String,
    region: String,
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

CloudFormationBlueprintSchema.methods.launch = function(launchOptions, infraManagerOptions, callback) {


};

CloudFormationBlueprintSchema.methods.update = function(updateData) {
    // infraManagerConfig = getInfraManagerConfigType(this);
    // infraManagerConfig.update(updateData);
    // this.infraManagerData = infraManagerConfig;

};


CloudFormationBlueprintSchema.methods.getVersionData = function(ver) {
    // infraManagerConfig = getInfraManagerConfigType(this);
    // return infraManagerConfig.getVersionData(ver);
    return null;
};



CloudFormationBlueprintSchema.methods.getLatestVersion = function() {
    // infraManagerConfig = getInfraManagerConfigType(this);
    // return infraManagerConfig.getLatestVersion();
    return null;
};



CloudFormationBlueprintSchema.methods.getCloudProviderData = function() {
    return {
        cloudProviderId: this.cloudProviderId
    };

}

CloudFormationBlueprintSchema.methods.getInfraManagerData = function() {
    return {
        infraMangerType: this.infraManagerType,
        infraManagerId: this.infraManagerId
        //   infraManagerData: this.infraManagerData
    };
};


// static methods
CloudFormationBlueprintSchema.statics.createNew = function(data) {


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
    var stackParameters = [];
    if (data.stackParameters) {
        for (var i = 0; i < data.stackParameters.length; i++) {
            var parameterObj = {
                ParameterKey: data.stackParameters[i].ParameterKey
            };
            if (data.stackParameters[i].type === 'Number') {
                parameterObj.ParameterValue = parseFloat(data.stackParameters[i].ParameterValue);
            } else {
                parameterObj.ParameterValue = data.stackParameters[i].ParameterValue;
            }
            stackParameters.push(parameterObj);
        }

    }

    var self = this;
    var cftBlueprint = new self({
        cloudProviderId: data.cloudProviderId,
        infraMangerType: infraManagerType,
        infraManagerId: data.infraManagerId,
        /*infraManagerData: infraManagerBlueprint,*/
        stackParameters: stackParameters,
        //stackName: data.stackName,
        templateFile: data.templateFile,
        region: data.region,
        instances: data.instances
        // instanceUsername: data.instanceUsername
    });


    return cftBlueprint;
};




var CloudFormationBlueprint = mongoose.model('CloudFormationBlueprint', CloudFormationBlueprintSchema);

module.exports = CloudFormationBlueprint;