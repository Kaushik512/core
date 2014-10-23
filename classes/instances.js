var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

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
        templateComponents: [String]
    },
  /*  services: {[
        serviceName: String,
        serviceType: [String],
         action: {
            assignAction: String,
            serviceRunlist: [String],
            recipe: String,
            command: String,
                 }
    ]} */
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
            data.forEach(function(inst){
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






    this.addService = function(instanceId, serviceData, callback) {
        Instances.update({
            "_id": new ObjectId(instanceId),
        }, {
            $push: {
                "services": {
                    serviceName: serviceData.Name,
                    serviceType: serviceData.Type,
                    action: {
                       assignAction : serviceData.Action,
                       serviceRunlist: serviceData.runlist,
                       recipe: serviceData.recipe,
                       command: serviceData.command   
                            },
                }
            }
        }, {
            upsert: true
        }, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    };


}

module.exports = new InstancesDao();
