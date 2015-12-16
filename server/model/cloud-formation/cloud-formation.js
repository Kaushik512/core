var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('_pr/model/utils/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var ChefInfraManager = require('./chef-infra-manager/chef-infra-manager');


var Schema = mongoose.Schema;


var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};

var CloudFormationSchema = new Schema({
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
    envId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.envIdValidator
    },
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
    templateFile: String,
    cloudProviderId: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed,
    infraManagerType: String,
    stackName: String,
    stackId: String,
    status: String,
    users: [String],
    region: String,
    instanceUsername: String,
    autoScaleTopicArn: String,
    autoScaleResourceIds: [String],
    autoScaleUsername: String,
    autoScaleRunlist: [String]
});


function getInfraManagerConfigType(cf) {
    var InfraManagerConfig;
    if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.CHEF) {
        InfraManagerConfig = ChefInfraManager;
    } else if (blueprint.infraMangerType === INFRA_MANAGER_TYPE.PUPPET) {
        return null;
    } else {
        return null;
    }
    var infraManagerConfig = new InfraManagerConfig(cf.infraManagerData);
    return infraManagerConfig;
}

// instance method :-  

CloudFormationSchema.methods.execute = function(userName, baseUrl, callback, onComplete) {

};

// Get Nodes list
CloudFormationSchema.methods.getChefTaskNodes = function() {};

CloudFormationSchema.methods.getHistory = function(callback) {

};





// Static methods :- 

// creates a new task
CloudFormationSchema.statics.createNew = function(cfData, callback) {
    var infraManager;
    var infraManagerType;
    if (cfData.infraManagerType === INFRA_MANAGER_TYPE.CHEF) {
        infraManagerType = INFRA_MANAGER_TYPE.CHEF;
        infraManager = ChefInfraManager.createNew({
            runlist: cfData.runlist
        });

    } else if (cfData.infraManagerType === INFRA_MANAGER_TYPE.PUPPET) {
        infraManagerType = INFRA_MANAGER_TYPE.PUPPET;
        return null;
    }


    var cfObj = {
        orgId: cfData.orgId,
        bgId: cfData.bgId,
        projectId: cfData.projectId,
        envId: cfData.envId,
        stackName: cfData.stackName,
        stackId: cfData.stackId,
        status: cfData.status,
        users: cfData.users,
        templateFile: cfData.templateFile,
        cloudProviderId: cfData.cloudProviderId,
        infraManagerId: cfData.infraManagerId,
        //infraManagerData: infraManager,
        infraManagerType: infraManagerType,
        stackParameters: cfData.stackParameters,
        region: cfData.region,
        instanceUsername: cfData.instanceUsername,
        autoScaleTopicArn: cfData.autoScaleTopicArn,
        autoScaleUsername: cfData.autoScaleUsername,
        autoScaleRunlist: cfData.autoScaleRunlist
    };

    var that = this;
    var cf = new that(cfObj);

    cf.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};

// creates a new task
CloudFormationSchema.statics.findByOrgBgProjectAndEnvId = function(orgId, bgId, projectId, envId, callback) {
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projectId,
        envId: envId
    }

    this.find(queryObj, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};

// get task by id
CloudFormationSchema.statics.getById = function(cfId, callback) {
    this.find({
        "_id": new ObjectId(cfId)
    }, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        if (data.length) {
            callback(null, data[0]);
        } else {
            callback(null, null);
        }

    });
};

// get task by ids
CloudFormationSchema.statics.findByIds = function(cfIds, callback) {
    if (!(cfIds && cfIds.length)) {
        callback(null, []);
        return;
    }
    var queryObj = {};
    queryObj._id = {
        $in: cfIds
    }
    this.find(queryObj, function(err, cfs) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, cfs);
    });
};


// remove task by id
CloudFormationSchema.statics.removeById = function(cfId, callback) {
    this.remove({
        "_id": new ObjectId(cfId)
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        callback(null, deleteCount);

    });
};

//Get by autoscale Id CloudFormation

CloudFormationSchema.statics.findByAutoScaleTopicArn = function(topicArn, callback) {
    if (!topicArn) {
        process.nextTick(function() {
            callback(new Error("Invalid topicArn"));
        });
        return;
    }
    this.find({
        "autoScaleTopicArn": topicArn
    }, function(err, cloudFormations) {
        if (err) {
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        callback(null, cloudFormations);

    });
};

CloudFormationSchema.statics.findByAutoScaleResourceId = function(resourceId, callback) {
    if (!resourceId) {
        process.nextTick(function() {
            callback(new Error("Invalid resourceId"));
        });
        return;
    }
    this.find({
        "autoScaleResourceIds": {
            '$in': [resourceId]
        }
    }, function(err, cloudFormations) {
        if (err) {
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        callback(null, cloudFormations);

    });
};




var CloudFormation = mongoose.model('cloudFormation', CloudFormationSchema);

module.exports = CloudFormation;