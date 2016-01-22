
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


var dashboardlandingsSchema = new Schema({
    jenkinsReferenceValue: {
        type: String,
        required: true
    },
    jobsListValue:{
        type: String,
        required: true
    }
});

// creates a new Dashboard Landing Page.
dashboardlandingsSchema.statics.createNew = function(dashboardlandingsData, callback) {
    logger.debug("Enter createNew landing dashboard");
    //logger.debug("Landing monog data:==========>"+JSON.stringify(dashboardlandingsData));
    var that = this;
    var dashboardlandings = new that({
        jenkinsReferenceValue: dashboardlandingsData.jenkinsReferenceValue,
        jobsListValue: dashboardlandingsData.jobsListValue,
    });
    dashboardlandings.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with new save");
        callback(null, aProvider);
        return;
    });
};
dashboardlandingsSchema.statics.getLandingDataInfo = function(callback) {
    logger.debug("Enter getting landingdata function");
      
    this.find(function(err, landingData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
            logger.debug("Exit getallLandingDataInfo");
            callback(null, landingData);
            return;
    });
};

var dashboardlandings = mongoose.model('dashboardlandings', dashboardlandingsSchema);

module.exports = dashboardlandings;