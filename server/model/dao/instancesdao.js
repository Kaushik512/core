var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('./schema-validator');
var uniqueValidator = require('mongoose-unique-validator');
var logger  = require('../../lib/logger')(module);


var Schema = mongoose.Schema;
var InstanceSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
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
    chefNodeName: String,
    runlist: [{
        type: String,
        trim: true,
        validate: schemaValidator.recipeValidator
    }],
    platformId: String,
    instanceIP: {
        type: String,
        trim: true
    },
    applicationUrl: {
        type: String,
        trim: true
    },
    applicationUrl1: {
        type: String,
        trim: true
    },
    instanceState: String,
    bootStrapStatus: String,
    users: [{
        type: String,
        trim: true,
        required: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    hardware: {
        platform: String,
        platformVersion: String,
        architecture: String,
        memory: {
            total: String,
            free: String,
        },
        os: String,
    },
    chef: {
        serverId: {
            type: String,
            required: true,
            trim: true
        },
        chefNodeName: String
    },
    credentials: {
        username: {
            type: String,
            required: true,
            trim: true
        },
        password: String,
        pemFileLocation: String
    },
    blueprintData: {
        blueprintId: String,
        blueprintName: String,
        templateId: String,
        templateType: String,
        templateComponents: [String],
        iconPath: String,
    },
    docker: {
        dockerEngineStatus: String,
        dockerEngineUrl: String
    },
    serviceIds: [{
        type: String,
        trim: true
    }]

});

InstanceSchema.plugin(uniqueValidator);

var Instances = mongoose.model('instances', InstanceSchema);

var InstancesDao = function() {

    this.getInstanceById = function(instanceId, callback) {
        logger.debug("Enter getInstanceById (%s)", instanceId);

        Instances.find({
            "_id": new ObjectId(instanceId)
        }, function(err, data) {
            if (err) {
                logger.error("Failed getInstanceById (%s)", instanceId, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit getInstanceById (%s)", instanceId);
            callback(null, data);

        });
    };

    this.getInstances = function(instanceIds, callback) {
        logger.debug("Enter getInstances :: ", instanceIds);
        var queryObj = {};
        if (instanceIds && instanceIds.length) {
            queryObj._id = {
                $in: instanceIds
            }
        }

        Instances.find(queryObj, function(err, data) {
            if (err) {
                logger.error("Failed to getInstances :: ", instanceIds, err);
                callback(err, null);
                return;
            }
            //logger.debug(data);
            logger.debug("Exit getInstances :: ", instanceIds);
            callback(null, data);
        });

    };


    this.getInstancesByProjectAndEnvId = function(projectId, envId, instanceType, userName, callback) {
        logger.debug("Enter getInstancesByProjectAndEnvId(%s, %s, %s, %s)", projectId, envId, instanceType, userName);
        var queryObj = {
            projectId: projectId,
            envId: envId
        }
        if (instanceType) {
            queryObj['blueprintData.templateType'] = instanceType;
        }
        if (userName) {
            queryObj.users = userName;
        }
        Instances.find(queryObj, function(err, data) {
            if (err) {
                logger.error("Failed to getInstancesByProjectAndEnvId(%s, %s, %s, %s)", projectId, envId, instanceType, userName, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit getInstancesByProjectAndEnvId(%s, %s, %s, %s)", projectId, envId, instanceType, userName);
            callback(null, data);
        });
    };

    this.getInstancesByOrgProjectAndEnvId = function(orgId, projectId, envId, instanceType, userName, callback) {
        logger.debug("Enter getInstancesByOrgProjectAndEnvId (%s, %s, %s, %s, %s)", orgId, projectId, envId, instanceType, userName);
        var queryObj = {
            orgId: orgId,
            projectId: projectId,
            envId: envId
        }
        if (instanceType) {
            queryObj['blueprintData.templateType'] = instanceType;
        }
        if (userName) {
            queryObj.users = userName;
        }
        Instances.find(queryObj, function(err, data) {
            if (err) {
                logger.error("Failed to getInstancesByOrgProjectAndEnvId (%s, %s, %s, %s, %s)", orgId, projectId, envId, instanceType, userName, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit getInstancesByOrgProjectAndEnvId (%s, %s, %s, %s, %s)", orgId, projectId, envId, instanceType, userName);
            callback(null, data);
        });
    };


    this.createInstance = function(instanceData, callback) {
        logger.debug("Enter createInstance");
         //Kana hack to add application url
        if(typeof instanceData.instanceIP != 'undefined')
        {
            instanceData.applicationUrl = 'http://' + instanceData.instanceIP + ':8380/GTConnect/UnifiedAcceptor/FrameworkDesktop.Main';
            instanceData.applicationUrl1 = 'http://' + instanceData.instanceIP + ':8280/GTConnect/UnifiedAcceptor/FrameworkDesktop.Main';
        }

        var instance = new Instances(instanceData);
       
        


        instance.save(function(err, data) {
            if (err) {
                logger.error("CreateInstance Failed", err, instanceData);
                callback(err, null);
                return;
            }
            logger.debug("Exit createInstance : " + JSON.stringify(data));
            callback(null, data);
        });
    };

    this.updateInstanceIp = function(instanceId, ipaddress, callback) {
        logger.debug("Enter updateInstanceIp (%s, %s)", instanceId, ipaddress);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "instanceIP": ipaddress
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateInstanceIp (%s, %s)", instanceId, ipaddress, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateInstanceIp (%s, %s)", instanceId, ipaddress);
            callback(null, data);
        });

    };

    this.updateInstanceAppUrl = function(instanceId, instnaceurl, callback) {
        logger.debug("Enter updateinstnaceurl (%s, %s)", instanceId, instnaceurl);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "applicationUrl": instnaceurl
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateinstnaceurl (%s, %s)", instanceId, instnaceurl, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateinstnaceurl (%s, %s)", instanceId, instnaceurl);
            callback(null, data);
        });

    };

    this.updateInstanceAppUrl1 = function(instanceId, instnaceurl, callback) {
        logger.debug("Enter updateinstnaceurl (%s, %s)", instanceId, instnaceurl);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "applicationUrl1": instnaceurl
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateinstnaceurl (%s, %s)", instanceId, instnaceurl, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateinstnaceurl (%s, %s)", instanceId, instnaceurl);
            callback(null, data);
        });

    };

    this.updateInstanceDockerStatus = function(instanceId, dockerstatus, dockerapiurl, callback) {
        logger.debug("Enter updateInstanceDockerStatus(%s, %s, %s)", instanceId, dockerstatus, dockerapiurl);

        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "docker": {
                    dockerEngineStatus: dockerstatus,
                    dockerEngineUrl: dockerapiurl
                }
            }
        }, {
            upsert: false
        }, function(err, data) {
            logger.error("Failed to updateInstanceDockerStatus(%s, %s, %s)", instanceId, dockerstatus, dockerapiurl, err);
            if (err) {
                callback(err, null);
                return;
            }

            logger.debug("Exit updateInstanceDockerStatus(%s, %s, %s)", instanceId, dockerstatus, dockerapiurl);
            callback(null, data);
        });

    };

    this.updateInstanceState = function(instanceId, state, callback) {
        logger.debug("Enter updateInstanceState (%s, %s)", instanceId, state);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "instanceState": state
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateInstanceState (%s, %s)", instanceId, state, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit updateInstanceState (%s, %s)", instanceId, state);
            callback(null, data);
        });
    };

    this.updateInstanceBootstrapStatus = function(instanceId, status, callback) {
        logger.debug("Enter updateInstanceBootstrapStatus (%s, %s)", instanceId, status);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "bootStrapStatus": status
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateInstanceBootstrapStatus (%s, %s)", instanceId, status, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateInstanceBootstrapStatus (%s, %s)", instanceId, status);
            callback(null, data);
        });
    };

    this.removeInstancebyId = function(instanceId, callback) {
        logger.debug("Enter removeInstancebyId (%s)", instanceId);
        Instances.remove({
            "_id": ObjectId(instanceId)
        }, function(err, data) {
            if (err) {
                logger.error("Failed to removeInstancebyId (%s)", instanceId, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit removeInstancebyId (%s)", instanceId);
            callback(null, data);
        });
    }

    this.updateInstanceLog = function(instanceId, log, callback) {
        logger.debug("Enter updateInstanceLog ", instanceId, log);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $push: {
                "logs": log
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateInstanceLog ", instanceId,log, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateInstanceLog", instanceId, log);
            callback(null, data);
        });
    };

    this.updateInstancesRunlist = function(instanceId, runlist, callback) {
        logger.debug("Enter updateInstancesRunlist ", instanceId, runlist);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "runlist": runlist
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to updateInstancesRunlist ", instanceId, runlist, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit updateInstancesRunlist ", instanceId, runlist);
            callback(null, data);
        });

    };

    this.setHardwareDetails = function(instanceId, hardwareData, callback) {
        logger.debug("Enter setHardwareDetails ", instanceId, hardwareData);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $set: {
                "hardware": {
                    platform: hardwareData.platform,
                    platformVersion: hardwareData.platformVersion,
                    architecture: hardwareData.architecture,
                    memory: {
                        total: hardwareData.memory.total,
                        free: hardwareData.memory.free,
                    },
                    os: hardwareData.os
                }
            }
        }, {
            upsert: false
        }, function(err, data) {
            if (err) {
                logger.error("Failed to setHardwareDetails ", instanceId, hardwareData, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit setHardwareDetails ", instanceId, hardwareData);
            callback(null, data);
        });

    };



    this.addService = function(instanceId, serviceIds, callback) {
        logger.debug("Enter addService ", instanceId, serviceIds);

        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $push: {
                "serviceIds": {
                    $each: serviceIds
                }
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                logger.error("Failed to addService ", instanceId, serviceIds, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit addService ", instanceId, serviceIds);
            callback(null, updateCount);

        });

    };

    this.deleteService = function(instanceId, serviceId, callback) {
        logger.debug("Enter deleteService ", instanceId, serviceIds);
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $pull: {
                "serviceIds": serviceId
            }
        }, {
            upsert: false,
            multi: true
        }, function(err, deleteCount) {
            if (err) {
                logger.error("Failed to deleteService ", instanceId, serviceIds, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit deleteService ", instanceId, serviceIds);
            callback(null, deleteCount);

        });

    };

    this.createServiceAction = function(instanceId, serviceId, actionData, callback) {
        logger.debug("Enter createServiceAction", instanceId, serviceId, actionData);
        var serviceAction = new ServiceAction({
            actionType: actionData.actionType,
            serviceRunlist: actionData.runlist,
            command: actionData.command,
        });

        Instances.update({
            "_id": new ObjectId(instanceId),
            "services._id": new ObjectId(serviceId),
        }, {
            $push: {
                "services.$.actions": serviceAction
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                logger.error("Failed to createServiceAction", instanceId, serviceId, actionData, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit createServiceAction", instanceId, serviceId, actionData);
            if (updateCount > 0) {
                callback(null, serviceAction);
            } else {
                callback(null, null);
            }

        });
    };

    this.getServiceAction = function(instanceId, serviceId, actionId, callback) {
        logger.debug("Enter getServiceAction ", instanceId, serviceId, actionId);
        Instances.find({
            "_id": new ObjectId(instanceId),
            "services._id": new ObjectId(serviceId),
        }, {
            "services": {
                "$elemMatch": {
                    "_id": new ObjectId(serviceId),
                    "actions": {
                        "$elemMatch": {
                            "_id": new ObjectId(actionId)
                        }
                    }
                }
            }
        }, function(err, data) {
            if (err) {
                logger.debug("Failed to getServiceAction ", instanceId, serviceId, actionId, err);
                callback(err, null);
                return;
            }
            logger.debug("Exit getServiceAction ", instanceId, serviceId, actionId);
            callback(null, data);


        });

    };


};

module.exports = new InstancesDao();