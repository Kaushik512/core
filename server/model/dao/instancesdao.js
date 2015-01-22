var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var InstanceSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true
    },
    projectId: {
        type: String,
        required: true,
        trim: true
    },
    envId: {
        type: String,
        required: true,
        trim: true
    },
    chefNodeName: String,
    runlist: [String],
    platformId: String,
    instanceIP: String,
    instanceState: String,
    bootStrapStatus: String,
    users: [String],
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
            required: true
        },
        chefNodeName: String
    },
    credentials: {
        username: {
            type: String,
            required: true
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
    serviceIds: [String]

});

InstanceSchema.plugin(uniqueValidator);

var Instances = mongoose.model('instances', InstanceSchema);

var InstancesDao = function() {

    this.getInstanceById = function(instanceId, callback) {

        Instances.find({
            "_id": new ObjectId(instanceId)
        }, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }

            callback(null, data);

        });
    }

    this.getInstances = function(instanceIds, callback) {
        var queryObj = {};
        if (instanceIds && instanceIds.length) {
            queryObj._id = {
                $in: instanceIds
            }
        }

        Instances.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log(data);
            callback(null, data);
        });

    };


    this.getInstancesByProjectAndEnvId = function(projectId, envId, instanceType, userName, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getInstancesByOrgProjectAndEnvId = function(orgId, projectId, envId, instanceType, userName, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };


    this.createInstance = function(instanceData, callback) {
        var instance = new Instances(instanceData);

        instance.save(function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log("Instance Created");
            callback(null, data);
        });
    };

    this.updateInstanceIp = function(instanceId, ipaddress, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    };

    this.updateInstanceDockerStatus = function(instanceId, dockerstatus, dockerapiurl, callback) {
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
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    };

    this.updateInstanceState = function(instanceId, state, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.updateInstanceBootstrapStatus = function(instanceId, status, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.removeInstancebyId = function(instanceId, callback) {
        Instances.remove({
            "_id": ObjectId(instanceId)
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    }

    this.updateInstanceLog = function(instanceId, log, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.updateInstancesRunlist = function(instanceId, runlist, callback) {

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
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    };

    this.setHardwareDetails = function(instanceId, hardwareData, callback) {
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
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    };



    this.addService = function(instanceId, serviceIds, callback) {
        console.log('length ==>', serviceIds.length);

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
                callback(err, null);
                return;
            }
            callback(null, updateCount);

        });

    };

    this.deleteService = function(instanceId, serviceId, callback) {
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
                callback(err, null);
                return;
            }

            callback(null, deleteCount);

        });

    };

    this.createServiceAction = function(instanceId, serviceId, actionData, callback) {
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
                callback(err, null);
                return;
            }
            if (updateCount > 0) {
                callback(null, serviceAction);
            } else {
                callback(null, null);
            }

        });
    };

    this.getServiceAction = function(instanceId, serviceId, actionId, callback) {

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
                callback(err, null);
                return;
            }

            callback(null, data);


        });

    }


}

module.exports = new InstancesDao();