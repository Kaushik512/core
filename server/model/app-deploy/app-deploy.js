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

// File which contains App Deploy DB schema and DAO methods. 

var Schema = mongoose.Schema;

var AppDeploySchema = new Schema({
    applicationName: String,
    applicationInstanceName: String,
    applicationVersion: String,
    applicationNodeIP: String,
    applicationLastDeploy: String,
    applicationStatus: String,
    orgId: String,
    bgId: String,
    projectId: String,
    envId: String

});

// Get all AppDeploy informations.
AppDeploySchema.statics.getAppDeploy = function(callback) {
    this.find(function(err, appDeploy) {
        if (err) {
            logger.debug("Got error while fetching AppDeploy: ", err);
            callback(err, null);
        }
        if (appDeploy) {
            logger.debug("Got AppDeploy: ", JSON.stringify(appDeploy));
            callback(null, appDeploy);
        }
    });
};

// Save all AppDeploy informations.
AppDeploySchema.statics.createNew = function(appDeployData, callback) {
    var aDeploy = new this(appDeployData);
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
};

// Update all AppDeploy informations.
AppDeploySchema.statics.updateAppDeploy = function(anId, appDeployData, callback) {

    logger.debug("Going to Update AppDeploy data: ", anId);
    var setData = {};
    var keys = Object.keys(appDeployData);
    for (var i = 0; i < keys.length; i++) {
        setData[keys[i]] = appDeployData[keys[i]];
    }
    logger.debug("Whole data: ", JSON.stringify(setData));
    this.update({
        "_id": anId
    }, {
        $set: setData
    }, {
        upsert: false
    }, function(err, appDeploy) {
        if (err) {
            logger.debug("Got error while creating AppDeploy: ", err);
            callback(err, null);
        }
        if (appDeploy) {
            logger.debug("Updating AppDeploy: ", JSON.stringify(appDeploy));
            callback(null, appDeploy);
        }
    });
};

// Get all AppDeploy informations.
AppDeploySchema.statics.getAppDeployById = function(anId, callback) {
    this.find({
        "_id": anId
    }, function(err, appDeploy) {
        if (err) {
            logger.debug("Got error while fetching AppDeploy: ", err);
            callback(err, null);
        }
        if (appDeploy) {
            logger.debug("Got AppDeploy: ", JSON.stringify(appDeploy[0]));
            callback(null, appDeploy[0]);
        }
    });
};

// Remove AppDeploy informations.
AppDeploySchema.statics.removeAppDeploy = function(anId, callback) {
    this.remove({
        "_id": anId
    }, function(err, appDeploy) {
        if (err) {
            logger.debug("Got error while removing AppDeploy: ", err);
            callback(err, null);
        }
        if (appDeploy) {
            logger.debug("Remove Success....");
            callback(null, appDeploy);
        }
    });
};

// Get all AppDeploy informations.
AppDeploySchema.statics.getAppDeployByNameAndEnvId = function(appName, envId, callback) {
    this.find({
        applicationName: appName,
        envId: envId
    }, function(err, appDeploys) {
        if (err) {
            logger.debug("Got error while fetching AppDeploy: ", err);
            callback(err, null);
        }
        if (appDeploys) {
            logger.debug("Got AppDeploy: ", JSON.stringify(appDeploys));
            callback(null, appDeploys);
        }
    });
};

var AppDeploy = mongoose.model("appDeploy", AppDeploySchema);
module.exports = AppDeploy;