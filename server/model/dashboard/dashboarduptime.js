
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


var dashboarduptimesSchema = new Schema({
    totaluptimecount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboarduptimesSchema.statics.createNew = function(dashboarduptimesData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboarduptimes = new that({
        totaluptimecount: dashboarduptimesData,
        timestamp: new Date().getTime(),
    });
    dashboarduptimes.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestuptimeDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboarduptimesSchema.statics.getLatestuptimeInfo = function(callback) {
    logger.debug("Enter getLatestuptimeDataInfo");
      
    this.find(function(err, uptimeData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (uptimeData.length) {
            logger.debug("Exit getLatestuptimeDataInfo with providers present");
            callback(null, uptimeData);
            return;
        } else {
            logger.debug("Exit getLatestuptimeDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboarduptimes = mongoose.model('dashboarduptimes', dashboarduptimesSchema);

module.exports = dashboarduptimes;