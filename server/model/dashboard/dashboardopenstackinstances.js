
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


var dashboardopenstackinstancesSchema = new Schema({
    totalopenstackinstancescount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardopenstackinstancesSchema.statics.createNew = function(dashboardopenstackInstancesData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardopenstackinstancesSchema = new that({
        totalopenstackinstancescount: dashboardopenstackInstancesData,
        timestamp: new Date().getTime(),
    });
    dashboardopenstackinstancesSchema.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestopenstackInstancesInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardopenstackinstancesSchema.statics.getLatestopenstackInstancesInfo = function(callback) {
    logger.debug("Enter getLatestopenstackInstancesInfo");
      
    this.find(function(err, openstackInstancesData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (openstackInstancesData.length) {
            logger.debug("Exit getLatestopenstackInstancesInfo with providers present");
            callback(null, openstackInstancesData);
            return;
        } else {
            logger.debug("Exit getLatestopenstackInstancesInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboardopenstackinstances = mongoose.model('dashboardopenstackinstances', dashboardopenstackinstancesSchema);

module.exports = dashboardopenstackinstances;