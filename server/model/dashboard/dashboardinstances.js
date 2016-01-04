/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Arabinda Behera <arabinda.behera@relevancelab.com>, 
 * December 2015
 */

// This file act as a Model which contains instances dashboard schema.
var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var providersdashboardSchema = new Schema({
    totalinstancecount: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    }
});
// creates a new Provider
providersdashboardSchema.statics.createNew = function(dashboardProviderData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardProvider = new that({
        totalinstancecount: dashboardProviderData,
        timestamp: new Date().getTime(),
    });
    dashboardProvider.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with dashboardProvider present");
        callback(null, aProvider);
        return;
    });
};

providersdashboardSchema.statics.getLatestProviderInfo = function(callback) {
    logger.debug("Enter getLatestProviderInfo");

    this.find(function(err, providerData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providerData.length) {
            logger.debug("Exit providerDataLatest with providers present");
            callback(null, providerData);
            return;
        } else {
            logger.debug("Exit providerDataLatest with no providers present");
            callback(null, null);
            return;
        }
    }).sort({
        _id: -1
    }).limit(1);
};

var providersdashboard = mongoose.model('providersdashboard', providersdashboardSchema);

module.exports = providersdashboard;