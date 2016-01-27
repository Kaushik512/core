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

// File which contains App Data DB schema and DAO methods. 

var Schema = mongoose.Schema;

var AppDataSchema = new Schema({
    nodeIp: String,
    server: String,
    repository: String,
    groupId: String,
    artifactId: String,
    version: String,
    projectId: String,
    envId: String,
    taskId: String
});


// Save or update appData informations.
AppDataSchema.statics.createNewOrUpdate = function(appData, callback) {
    this.find({
        nodeIp: appData.nodeIp,
        projectId: appData.projectId,
        envId: envId
    }, function(err, aData) {
        if (err) {
            logger.debug("Error fetching record.", err);
            callback(err, null);
        }
        if (data.length) {
            var setData = {};
            var keys = Object.keys(appData);
            for (var i = 0; i < keys.length; i++) {
                setData[keys[i]] = appData[keys[i]];
            }
            var that = this;
            that.update({
                nodeIp: appData.nodeIp,
                projectId: appData.projectId,
                envId: envId
            }, {
                $set: setData
            }, {
                upsert: false
            }, function(err, updatedData) {
                if (err) {
                    logger.debug("Failed to update: ", err);
                    callback(err, null);
                }
                callback(null, updatedData);
            });
        } else {
            this.save(function(err, appData) {
                if (err) {
                    logger.debug("Got error while creating appData: ", err);
                    callback(err, null);
                }
                logger.debug("Creating appData: ", JSON.stringify(appData));
                callback(null, appData);
            });
        }
    });
};

// Get AppData by ip,project,env.
AppDataSchema.statics.getAppDataByIpAndProjectAndEnv = function(nodeIp, projectId, envId, callback) {
    this.find({
        nodeIp: appData.nodeIp,
        projectId: appData.projectId,
        envId: envId
    }, function(err, anAppData) {
        if (err) {
            logger.debug("Got error while fetching appData: ", err);
            callback(err, null);
        }
        logger.debug("Got appData: ", JSON.stringify(anAppData));
        callback(null, anAppData);
    });
};

var AppData = mongoose.model("appData", AppDataSchema);
module.exports = AppData;
