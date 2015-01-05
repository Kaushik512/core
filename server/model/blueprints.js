var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var BlueprintSchema = new Schema({
    orgId: String,
    projectId: String,
    envId: String,
    iconpath: String,
    name: String,
    templateId: String,
    templateType: String,
    dockercontainerpathstitle: String,
    dockercontainerpaths: String,
    dockerrepotags: String,
    dockerreponame: String,
    dockercontainerstartcommand: String,
    templateComponents: [String],
    instanceType: String,
    instanceOS: String,
    instanceAmiid: String,
    instanceUsername: String,
    importInstance: Boolean,
    chefServerId: String,
    users: [String],
    versionsList: [{
        ver: String,
        runlist: [String],
        expirationDays: Number,
    }],
    latestVersion: String,
    cloudFormationStackName: String,
    cloudFormationStackParameters: [{
        ParameterKey: String,
        ParameterValue: String
    }]

});

var Blueprint = mongoose.model('blueprints', BlueprintSchema);

function generateBlueprintVersionNumber(prevVersion) {
    if (!prevVersion) {
        return "0.1";
    }

    var parts = prevVersion.split('.');
    var major = parseInt(parts[0]);
    var minor = parseInt(parts[1]);
    minor++;

    if (minor === 10) {
        major++;
        minor = 0;
    }

    return major + '.' + minor;
}

var BlueprintsDao = function() {

    this.getBlueprintById = function(blueprintId, callback) {
        console.log(blueprintId);
        Blueprint.find({
            "_id": new ObjectId(blueprintId)
        }, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log('data ==>', data);
            callback(null, data);

        });
    };

    this.getBlueprintsByProjectAndEnvId = function(projectId, envId, blueprintType, userName, callback) {
        var queryObj = {
            projectId: projectId,
            envId: envId
        }
        if (blueprintType) {
            queryObj.templateType = blueprintType;
        }
        if (userName) {
            queryObj.users = userName;
        }
        Blueprint.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getBlueprintsByOrgProjectAndEnvId = function(orgId, projectId, envId, blueprintType, userName, callback) {
        var queryObj = {
            orgId: orgId,
            projectId: projectId,
            envId: envId
        }
        if (blueprintType) {
            queryObj.templateType = blueprintType;
        }
        if (userName) {
            queryObj.users = userName;
        }
        console.log('in here' + JSON.stringify(queryObj));
        Blueprint.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.createBlueprint = function(blueprintData, callback) {
        console.log('Just before save ->', blueprintData);
        var blueprint = new Blueprint({
            orgId: blueprintData.orgId,
            projectId: blueprintData.projectId,
            envId: blueprintData.envId,
            name: blueprintData.name,
            iconpath: blueprintData.iconpath,
            templateId: blueprintData.templateId,
            templateType: blueprintData.templateType,

            dockercontainerpathstitle: blueprintData.dockercontainerpathstitle,
            dockercontainerpaths: blueprintData.dockercontainerpaths,
            dockerrepotags: blueprintData.dockerrepotags,
            dockerreponame: blueprintData.dockerreponame,
            dockercontainerstartcommand: blueprintData.dockercontainerstartcommand,
            templateComponents: blueprintData.templateComponents,
            chefServerId: blueprintData.chefServerId,
            instanceType: blueprintData.instanceType,
            instanceOS: blueprintData.instanceOS,
            instanceAmiid: blueprintData.instanceAmiid,
            instanceUsername: blueprintData.instanceUsername,
            importInstance: blueprintData.importInstance,
            users: blueprintData.users,
            versionsList: [{
                ver: generateBlueprintVersionNumber(null),
                runlist: blueprintData.runlist,
                expirationDays: blueprintData.expirationDays,
            }],
            latestVersion: generateBlueprintVersionNumber(null),
            cloudFormationStackName: blueprintData.cloudFormationStackName,
            cloudFormationStackParameters: blueprintData.cloudFormationStackParameters
        });

        blueprint.save(function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log("Blueprint Created >>>" + JSON.stringify(blueprint));
            callback(null, data);
        });
    };

    this.updateBlueprint = function(blueprintId, updateData, callback) {
        this.getBlueprintById(blueprintId, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            if (data.length) {
                console.log('updating');
                var latestVersion = data[0].latestVersion;
                var newVersion = generateBlueprintVersionNumber(latestVersion);
                Blueprint.update({
                    "_id": new ObjectId(blueprintId)
                }, {
                    $set: {
                        latestVersion: newVersion
                    },
                    $push: {
                        versionsList: {
                            ver: newVersion,
                            runlist: updateData.runlist,
                            expirationDays: updateData.expirationDays,
                        }
                    }
                }, {
                    upsert: false
                }, function(err, updatedData) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, {
                        version: newVersion,
                        cout: updatedData
                    });
                });
            } else {
                callback(null, 0);
            }
        });
    };

    this.removeBlueprintbyId = function(blueprintId, callback) {
        Blueprint.remove({
            "_id": ObjectId(blueprintId)
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    }

    this.getBlueprintVersionData = function(blueprintId, version, callback) {
        var queryObj = {
            "_id": new ObjectId(blueprintId)
        };

        var projectionObj = {};
        if (version) {
            projectionObj = {
                versionsList: {
                    $elemMatch: {
                        ver: version
                    }
                }
            }

            queryObj["versionsList.ver"] = version;
        }

        Blueprint.find(queryObj, projectionObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log('data ==>', data);
            if (data.length) {
                callback(null, data[0].versionsList);
            } else {
                callback(null, []);
            }


        });
    }
}

module.exports = new BlueprintsDao();