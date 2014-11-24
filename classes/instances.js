var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var ServiceActionSchema = new Schema({
    actionType: String,
    serviceRunlist: [String],
    command: String,
});

var ServiceAction = mongoose.model('ServiceActions', ServiceActionSchema);

var ServiceSchema = new Schema({
    serviceName: String,
    serviceUsers: [String],
    actions: [ServiceActionSchema]
});

var Service = mongoose.model('Services', ServiceSchema);

var InstanceSchema = new Schema({
    orgId: String,
    projectId: String,
    envId: String,
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
        serverId: String,
        chefNodeName: String
    },
    credentials: {
        username: String,
        password: String,
        pemFileLocation: String,
    },
    blueprintData: {
        blueprintId: String,
        blueprintName: String,
        templateId: String,
        templateType: String,
        templateComponents: [String],
        iconPath: String,
    },
    services: [ServiceSchema]

});

var Instances = mongoose.model('instances', InstanceSchema);

var InstancesDao = function() {

    this.getInstanceById = function(instanceId, callback) {
        console.log(instanceId);
        Instances.find({
            "_id": new ObjectId(instanceId)
        }, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            //console.log('data ==>', data);
            callback(null, data);

        });
    }

    this.getInstances = function(callback) {

        Instances.find({}, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            data.forEach(function(inst) {
                console.log(inst.projectId);
                inst.bggroup = 'test';
                // inst['bggroup'] = 'test';
            });
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



    this.createService = function(instanceId, serviceData, callback) {

        var service = new Service({
            serviceName: serviceData.name,
            serviceUsers: serviceData.users
        });

        if (serviceData.actions && serviceData.actions.length) {
            for (var i = 0; i < serviceData.actions.length; i++) {
                console.log('action ==>', serviceData.actions[i]);
                var serviceAction = new ServiceAction({
                    actionType: serviceData.actions[i].actionType,
                    serviceRunlist: serviceData.actions[i].runlist,
                    command: serviceData.actions[i].command,
                });

                service.actions.push(serviceAction);
            }
        }

        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $push: {
                "services": service
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                callback(err, null);
                return;
            }
            if (updateCount > 0) {
                callback(null, service);
            } else {
                callback(null, null);
            }
        });

    };

    this.deleteService = function(instanceId, serviceId, callback) {

        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $pull: {
                "services": {
                    "_id": new ObjectId(serviceId)
                }
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