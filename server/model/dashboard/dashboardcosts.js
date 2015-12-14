
/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Model which contains provider schema and dao methods.

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var dashboardcostsSchema = new Schema({
    totalcostcount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardcostsSchema.statics.createNew = function(dashboardCostsData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardCosts = new that({
        totalcostcount: dashboardCostsData,
        timestamp: new Date().getTime(),
    });
    dashboardCosts.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestcostDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardcostsSchema.statics.getLatestCostInfo = function(callback) {
    logger.debug("Enter getLatestcostDataInfo");
      
    this.find(function(err, costData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (costData.length) {
            logger.debug("Exit getLatestcostDataInfo with providers present");
            callback(null, costData);
            return;
        } else {
            logger.debug("Exit getLatestcostDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};
/*providersdashboardSchema.statics.getAllAWSProvidersDashboard = function(dashboardAllAwsProviderData, callback) {
    logger.debug("Enter dashboardAllAwsProviderData");
      
    this.find({
        orgId : orgId
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            logger.debug("Exit getAWSProvidersByOrgId with providers present");
            callback(null, providers);
            return;
        } else {
            logger.debug("Exit getAWSProvidersByOrgId with no providers present");
            callback(null, null);
            return;
        }

    });
};*/

var dashboardcosts = mongoose.model('dashboardcosts', dashboardcostsSchema);

module.exports = dashboardcosts;