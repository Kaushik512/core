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
var schemaValidator = require('_pr/model/utils/schema-validator');

var uniqueValidator = require('mongoose-unique-validator');

var DockerBlueprint = require('./blueprint-types/docker-blueprint/docker-blueprint');
var InstanceBlueprint = require('./blueprint-types/instance-blueprint/instance-blueprint');
var OpenstackBlueprint = require('./blueprint-types/instance-blueprint/openstack-blueprint/openstack-blueprint');
var AzureBlueprint = require('./blueprint-types/instance-blueprint/azure-blueprint/azure-blueprint');
var VmwareBlueprint = require('./blueprint-types/instance-blueprint/vmware-blueprint/vmware-blueprint');

var CloudFormationBlueprint = require('./blueprint-types/cloud-formation-blueprint/cloud-formation-blueprint');

var BLUEPRINT_TYPE = {
    DOCKER: 'docker',
    AWS_CLOUDFORMATION: 'aws_cf',
    INSTANCE_LAUNCH: "instance_launch",
    OPENSTACK_LAUNCH: "openstack_launch",
    HPPUBLICCLOUD_LAUNCH: "hppubliccloud_launch",
    AZURE_LAUNCH: "azure_launch",
    VMWARE_LAUNCH: "vmware_launch"
};

var Schema = mongoose.Schema;

var BlueprintSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
    },
    bgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.bgIdValidator
    },
    projectId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.projIdValidator
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.blueprintNameValidator
    },
    blueprintType: {
        type: String,
        required: true,
        trim: true
    },
    iconpath: {
        type: String,
        trim: true
    },
    appUrls: [{
        name: String,
        url: String
    }],
    templateId: {
        type: String,
        required: true,
        trim: true
    },
    users: [{
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    templateType: {
        type: String,
        required: true,
        trim: true
    },
    blueprintConfig: Schema.Types.Mixed
});

function getBlueprintConfigType(blueprint) {
    var BlueprintConfigType;
    if ((blueprint.blueprintType === BLUEPRINT_TYPE.INSTANCE_LAUNCH) && blueprint.blueprintConfig) {
        BlueprintConfigType = InstanceBlueprint;
    } else if ((blueprint.blueprintType === BLUEPRINT_TYPE.DOCKER) && blueprint.blueprintConfig) {
        BlueprintConfigType = DockerBlueprint;
    } else if ((blueprint.blueprintType === BLUEPRINT_TYPE.AWS_CLOUDFORMATION) && blueprint.blueprintConfig) {
        BlueprintConfigType = CloudFormationBlueprint;
    } else if ((blueprint.blueprintType === BLUEPRINT_TYPE.OPENSTACK_LAUNCH || blueprint.blueprintType === BLUEPRINT_TYPE.HPPUBLICCLOUD_LAUNCH) && blueprint.blueprintConfig) {
        BlueprintConfigType = OpenstackBlueprint;
    } else if ((blueprint.blueprintType === BLUEPRINT_TYPE.AZURE_LAUNCH) && blueprint.blueprintConfig) {
        BlueprintConfigType = InstanceBlueprint;
    } else if ((blueprint.blueprintType === BLUEPRINT_TYPE.VMWARE_LAUNCH) && blueprint.blueprintConfig) {
        logger.debug('this is test');
        BlueprintConfigType = VmwareBlueprint;
    } else {
        return;
    }
    var blueprintConfigType = new BlueprintConfigType(blueprint.blueprintConfig);
    return blueprintConfigType;
}

// instance methods
BlueprintSchema.methods.update = function(updateData, callback) {
    var blueprintConfigType = getBlueprintConfigType(this);
    if (!blueprintConfigType) {
        process.nextTick(function() {
            callback({
                message: "Invalid Blueprint Type"
            }, null);
        });
    }
    blueprintConfigType.update(updateData);
    this.blueprintConfig = blueprintConfigType;
    this.save(function(err, updatedBlueprint) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, updatedBlueprint);
    });
};

BlueprintSchema.methods.getVersionData = function(ver) {
    var blueprintConfigType = getBlueprintConfigType(this);
    if (!blueprintConfigType) {
        return null;
    }

    return blueprintConfigType.getVersionData(ver);
};

BlueprintSchema.methods.getLatestVersion = function() {
    var blueprintConfigType = getBlueprintConfigType(this);
    if (!blueprintConfigType) {
        return null;
    }

    return blueprintConfigType.getLatestVersion();
};

BlueprintSchema.methods.getInfraManagerData = function() {
    var blueprintConfigType = getBlueprintConfigType(this);
    if (!blueprintConfigType) {
        return null;
    }

    return blueprintConfigType.getInfraManagerData();
}

BlueprintSchema.methods.getCloudProviderData = function() {
    var blueprintConfigType = getBlueprintConfigType(this);
    if (!blueprintConfigType) {
        return null;
    }

    return blueprintConfigType.getCloudProviderData();
}

BlueprintSchema.methods.launch = function(envId, ver, callback) {
    var blueprintConfigType = getBlueprintConfigType(this);
    blueprintConfigType.launch(ver, function(err, launchData) {
        callback(err, launchData);
    });
};

// static methods
BlueprintSchema.statics.createNew = function(blueprintData, callback) {
    logger.debug('blueprintData.cloudFormationData ==>', blueprintData.cloudFormationData);

    var blueprintConfig, blueprintType;
    if ((blueprintData.blueprintType === BLUEPRINT_TYPE.INSTANCE_LAUNCH) && blueprintData.instanceData) {
        blueprintType = BLUEPRINT_TYPE.INSTANCE_LAUNCH;
        blueprintConfig = InstanceBlueprint.createNew(blueprintData.instanceData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.DOCKER) && blueprintData.dockerData) {
        blueprintType = BLUEPRINT_TYPE.DOCKER;
        blueprintConfig = DockerBlueprint.createNew(blueprintData.dockerData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.AWS_CLOUDFORMATION) && blueprintData.cloudFormationData) {
        blueprintType = BLUEPRINT_TYPE.AWS_CLOUDFORMATION;
        blueprintConfig = CloudFormationBlueprint.createNew(blueprintData.cloudFormationData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.OPENSTACK_LAUNCH) && blueprintData.instanceData) {
        blueprintType = BLUEPRINT_TYPE.OPENSTACK_LAUNCH;
        logger.debug('blueprintData openstack instacedata ==>', blueprintData.instanceData);
        blueprintConfig = OpenstackBlueprint.createNew(blueprintData.instanceData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.HPPUBLICCLOUD_LAUNCH) && blueprintData.instanceData) {
        blueprintType = BLUEPRINT_TYPE.HPPUBLICCLOUD_LAUNCH;
        logger.debug('blueprintData openstack instacedata ==>', blueprintData.instanceData);
        blueprintConfig = OpenstackBlueprint.createNew(blueprintData.instanceData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.AZURE_LAUNCH) && blueprintData.instanceData) {
        blueprintType = BLUEPRINT_TYPE.AZURE_LAUNCH;
        logger.debug('blueprintData azure instacedata ==>', blueprintData.instanceData);
        blueprintConfig = AzureBlueprint.createNew(blueprintData.instanceData);
        blueprintConfig.cloudProviderData = AzureBlueprint.createNew(blueprintData.instanceData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.VMWARE_LAUNCH) && blueprintData.instanceData) {
        blueprintType = BLUEPRINT_TYPE.VMWARE_LAUNCH;
        logger.debug('blueprintData vmware instacedata ==>', blueprintData.instanceData);
        blueprintConfig = VmwareBlueprint.createNew(blueprintData.instanceData);

    } else {
        process.nextTick(function() {
            callback({
                message: "Invalid Blueprint Type sdds"
            }, null);
        });
        return;
    }
    logger.debug('blueprin type ', blueprintData);
    var blueprintObj = {
        orgId: blueprintData.orgId,
        bgId: blueprintData.bgId,
        projectId: blueprintData.projectId,
        name: blueprintData.name,
        appUrls: blueprintData.appUrls,
        iconpath: blueprintData.iconpath,
        templateId: blueprintData.templateId,
        templateType: blueprintData.templateType,
        users: blueprintData.users,
        blueprintConfig: blueprintConfig,
        blueprintType: blueprintType
    };

    var blueprint = new Blueprints(blueprintObj);
    logger.debug('saving');
    blueprint.save(function(err, blueprint) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug('save Complete');
        callback(null, blueprint);
    });
};


BlueprintSchema.statics.getById = function(id, callback) {
    logger.debug('finding blueprint by id ===>' + id);
    this.findById(id, function(err, blueprint) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, blueprint);
    });
};

BlueprintSchema.statics.removeById = function(id, callback) {
    this.remove({
        "_id": ObjectId(id)
    }, function(err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, data);
    });

};

BlueprintSchema.statics.getBlueprintsByOrgBgProject = function(orgId, bgId, projId, filterBlueprintType, callback) {
    logger.debug("Enter getBlueprintsByOrgBgProject(%s,%s, %s, %s, %s)", orgId, bgId, projId, filterBlueprintType);
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projId,
    }
    if (filterBlueprintType) {
        queryObj.templateType = filterBlueprintType;
    }

    this.find(queryObj, function(err, blueprints) {
        if (err) {
            callback(err, null);
            return;
        }
        logger.debug("Exit getBlueprintsByOrgBgProject(%s,%s, %s, %s, %s)", orgId, bgId, projId, filterBlueprintType);
        callback(null, blueprints);
    });
};

var Blueprints = mongoose.model('blueprints', BlueprintSchema);

module.exports = Blueprints;
