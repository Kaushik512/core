/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Aug 2015
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
                }else{
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
AppDataSchema.statics.getAppDataWithDeploy = function(callback) {
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

var AppData = mongoose.model("appData", AppDataSchema);
module.exports = AppData;
