
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


var dashboardmanagedinstancesSchema = new Schema({
    totalmanagedinstancescount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardmanagedinstancesSchema.statics.createNew = function(dashboardManagedInstancesData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardmanagedinstancesSchema = new that({
        totalmanagedinstancescount: dashboardManagedInstancesData,
        timestamp: new Date().getTime(),
    });
    dashboardmanagedinstancesSchema.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestManagedInstancesInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardmanagedinstancesSchema.statics.getLatestManagedInstancesInfo = function(callback) {
    logger.debug("Enter getLatestManagedInstancesInfo");
      
    this.find(function(err, managedInstancesData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (managedInstancesData.length) {
            logger.debug("Exit getLatestManagedInstancesInfo with providers present");
            callback(null, managedInstancesData);
            return;
        } else {
            logger.debug("Exit getLatestManagedInstancesInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboardmanagedinstances = mongoose.model('dashboardmanagedinstances', dashboardmanagedinstancesSchema);

module.exports = dashboardmanagedinstances;