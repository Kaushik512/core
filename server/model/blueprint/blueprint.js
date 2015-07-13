var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('_pr/model/utils/schema-validator');

var uniqueValidator = require('mongoose-unique-validator');

var DockerBlueprint = require('./blueprint-types/docker-blueprint/docker-blueprint');
var InstanceBlueprint = require('./blueprint-types/instance-blueprint/instance-blueprint');

var BLUEPRINT_TYPE = {
    DOCKER: 'docker',
    AWS_CLOUDFORMATION: 'aws_cf',
    INSTANCE_LAUNCH: "instance_launch"
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
    users: [{
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    dockerBlueprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DockerBlueprint.modelName
    },
    instanceBlueprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: InstanceBlueprint.modelName
    },

});

// static methods
BlueprintSchema.statics.createNew = function(blueprintData, callback) {
    var dockerBlueprint, instanceBlueprint;


    if ((blueprintData.blueprintType === BLUEPRINT_TYPE.INSTANCE_LAUNCH) && blueprintData.instanceData) {
        logger.debug(blueprintData.blueprintType,blueprintData.instanceData);
        instanceBlueprint = InstanceBlueprint.createNew(blueprintData.instanceData);
    } else if ((blueprintData.blueprintType === BLUEPRINT_TYPE.DOCKER) && blueprintData.dockerData) {
        dockerBlueprint = DockerBlueprint.createNew(blueprintData.dockerData);
    } else {
        process.nextTick(function() {
            callback({
                message: "Invalid Blueprint Type"
            }, null);
        });
        return;
    }

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
        dockerBlueprint: dockerBlueprint,
        instanceBlueprint: instanceBlueprint
    };

    var blueprint = new Blueprints(blueprintObj);
    console.log('saving');
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


BlueprintSchema.static.getBlueprintsByOrgBgProject = function(orgId, bgId, projId, filterBlueprintType, callback) {
    logger.debug("Enter getBlueprintsByOrgBgProject(%s,%s, %s, %s, %s)", orgId, bgId, projectId, blueprintType, userName);
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projId,
    }
    if (blueprintType) {
        queryObj.templateType = filterBlueprintType;
    }

    this.find(queryObj, function(err, blueprints) {
        if (err) {
            callback(err, null);
            return;
        }
        logger.debug("Exit getBlueprintsByOrgBgProject(%s,%s, %s, %s, %s)", orgId, bgId, projectId, blueprintType, userName);
        callback(null, blueprints);
    });
};


var Blueprints = mongoose.model('blueprints', BlueprintSchema);

module.exports = Blueprints;