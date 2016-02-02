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


var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');
var schemaValidator = require('_pr/model/utils/schema-validator');
var AppDeploy = require('_pr/model/app-deploy/app-deploy');

// File which contains App Data DB schema and DAO methods. 

var Schema = mongoose.Schema;

var AppDataSchema = new Schema({
    applicationName: {
        type: String,
        unique: true
    },
    projectId: String,
    description: String
});

// Get all appData informations.
AppDataSchema.statics.getAppData = function(callback) {
    this.find(function(err, appData) {
        if (err) {
            logger.debug("Got error while fetching appData: ", err);
            callback(err, null);
        }
        if (appData) {
            logger.debug("Got appData: ", JSON.stringify(appData));
            callback(null, appData);
        }
    });
};

// Save all appData informations.
AppDataSchema.statics.createNew = function(appDeployData, callback) {
    var aDeploy = new this(appDeployData);
    this.find({
        applicationName: appDeployData.applicationName,
        projectId: appDeployData.projectId
    }, function(err, data) {
        if (err) {
            logger.debug("Error fetching record.", err);
        }
        if (data.length) {
            callback(true, null);
        } else {
            aDeploy.save(function(err, appDeploy) {
                if (err) {
                    logger.debug("Got error while creating AppDeploy: ", err);
                    callback(err, null);
                }
                if (appDeploy) {
                    logger.debug("Creating AppDeploy: ", JSON.stringify(appDeploy));
                    callback(null, appDeploy);
                }
            });
        }
    });
};

// Get AppDeploy by name.
AppDataSchema.statics.getAppDataByName = function(appName, callback) {
    this.find({
        applicationName: appName
    }, function(err, anAppData) {
        if (err) {
            logger.debug("Got error while fetching appData: ", err);
            callback(err, null);
        }
        if (anAppData.length) {
            var appData = [];

            AppDeploy.getAppDeployByName(appName, function(err, data) {
                if (err) {
                    logger.debug("App deploy fetch error.", err);
                }
                if (data.length) {
                    for (var i = 0; i < data.length; i++) {
                        var dummyData = {
                            _id: data[i]._id,
                            applicationName: data[i].applicationName,
                            applicationInstanceName: data[i].applicationInstanceName,
                            applicationVersion: data[i].applicationVersion,
                            applicationNodeIP: data[i].applicationNodeIP,
                            applicationLastDeploy: data[i].applicationLastDeploy,
                            applicationStatus: data[i].applicationStatus,
                            projectId: anAppData[0].projectId,
                            envId: data[i].envId,
                            description: anAppData[0].description,
                            applicationType: data[i].applicationType,
                            containerId: data[i].containerId,
                            hostName: data[i].hostName
                        };
                        appData.push(dummyData);
                    }
                    callback(null, appData);
                } else {
                    callback(null, data);
                }
            });
        } else {
            logger.debug("Else part..");
            callback(null, anAppData);
        }
    });
};

// Get all appData informations.
AppDataSchema.statics.getAppDataWithDeploy = function(envName, callback) {
    this.find(function(err, appData) {
        if (err) {
            logger.debug("Got error while fetching appData: ", err);
            callback(err, null);
        }
        if (appData.length) {
            var appDataList = [];
            var count = 0;
            for (var j = 0; j < appData.length; j++) {
                (function(j) {
                    AppDeploy.getAppDeployByName(appData[j].applicationName, function(err, data) {
                        count++;
                        if (err) {
                            logger.debug("App deploy fetch error.", err);
                        }
                        if (data.length) {
                            for (var i = 0; i < data.length; i++) {
                                var dummyData = {
                                    _id: data[i]._id,
                                    applicationName: data[i].applicationName,
                                    applicationInstanceName: data[i].applicationInstanceName,
                                    applicationVersion: data[i].applicationVersion,
                                    applicationNodeIP: data[i].applicationNodeIP,
                                    applicationLastDeploy: data[i].applicationLastDeploy,
                                    applicationStatus: data[i].applicationStatus,
                                    projectId: appData[j].projectId,
                                    envId: data[i].envId,
                                    description: appData[j].description,
                                    applicationType: data[i].applicationType,
                                    containerId: data[i].containerId,
                                    hostName: data[i].hostName
                                };
                                appDataList.push(dummyData);
                            }
                            if (count === appData.length) {
                                callback(null, appDataList);
                            }
                        } else {
                            if (count === appData.length) {
                                callback(null, appDataList);
                            }
                        }
                    });
                })(j);
            }

        } else {
            callback(null, []);
        }
    });
};

// Get all appData informations.
AppDataSchema.statics.getAppDataWithDeployList = function(envName, callback) {
    var that = this;
    AppDeploy.getAppDeployListByEnvId(envName, function(err, data) {
        if (err) {
            logger.debug("App deploy fetch error.", err);
        }
        logger.debug("App deploy .", JSON.stringify(data));
        if (data.length) {
            var appDataList = [];
            var count = 0;
            for (var i = 0; i < data.length; i++) {
                (function(i) {
                    that.find({
                        applicationName: data[i].applicationName
                    }, function(err, appData) {
                        count++;
                        if (err) {
                            logger.debug("Failed to fetch app data", err);
                            callback(err, null);
                        }
                        if (appData) {
                            var dummyData = {
                                _id: data[i].id,
                                applicationName: data[i].applicationName,
                                applicationInstanceName: data[i].applicationInstanceName,
                                applicationVersion: data[i].applicationVersion,
                                applicationNodeIP: data[i].applicationNodeIP,
                                applicationLastDeploy: data[i].applicationLastDeploy,
                                applicationStatus: data[i].applicationStatus,
                                projectId: appData[0].projectId,
                                envId: data[i].envId,
                                description: appData[0].description,
                                applicationType: data[i].applicationType,
                                containerId: data[i].containerId,
                                hostName: data[i].hostName
                            };
                            appDataList.push(dummyData);
                            if (count === data.length) {
                                callback(null, appDataList);
                            }
                        } else {
                            callback(null, []);
                        }

                    });
                })(i);
            }
        } else {
            callback(null, []);
        }
    });
};

var AppData = mongoose.model("appData", AppDataSchema);
module.exports = AppData;
