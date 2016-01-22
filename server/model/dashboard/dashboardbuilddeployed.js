
/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Arabinda Behera <arabinda.behera@relevancelab.com>, 
 * December 2015
 */

// This file act as a Model which contains provider schema and dao methods.

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var dashboarddeployedbuildsSchema = new Schema({
    totaldeployedbuildcount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboarddeployedbuildsSchema.statics.createNew = function(dashboarddeployedbuildsData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboarddeployedbuilds = new that({
        totaldeployedbuildcount: dashboarddeployedbuildsData,
        timestamp: new Date().getTime(),
    });
    dashboarddeployedbuilds.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestdeployedbuildDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboarddeployedbuildsSchema.statics.getLatestdeployedbuildInfo = function(callback) {
    logger.debug("Enter getLatestdeployedbuildDataInfo");
      
    this.find(function(err, deployedbuildData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (deployedbuildData.length) {
            logger.debug("Exit getLatestdeployedbuildDataInfo with providers present");
            callback(null, deployedbuildData);
            return;
        } else {
            logger.debug("Exit getLatestdeployedbuildDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboarddeployedbuilds = mongoose.model('dashboarddeployedbuilds', dashboarddeployedbuildsSchema);

module.exports = dashboarddeployedbuilds;