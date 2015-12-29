
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


var dashboardusagesSchema = new Schema({
    totalusagecount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardusagesSchema.statics.createNew = function(dashboardusagesData, callback) {
    logger.debug("Enter createNew usage dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardusages = new that({
        totalusagecount: dashboardusagesData,
        timestamp: new Date().getTime(),
    });
    dashboardusages.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestusageDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardusagesSchema.statics.getLatestusageInfo = function(callback) {
    logger.debug("Enter getLatestusageDataInfo");
      
    this.find(function(err, usageData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (usageData.length) {
            logger.debug("Exit getLatestusageDataInfo with providers present");
            callback(null, usageData);
            return;
        } else {
            logger.debug("Exit getLatestusageDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboardusages = mongoose.model('dashboardusages', dashboardusagesSchema);

module.exports = dashboardusages;