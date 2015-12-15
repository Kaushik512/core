
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


var dashboardpassedbuildsSchema = new Schema({
    totalpassedbuildcount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardpassedbuildsSchema.statics.createNew = function(dashboardpassedbuildsData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardpassedbuilds = new that({
        totalpassedbuildcount: dashboardpassedbuildsData,
        timestamp: new Date().getTime(),
    });
    dashboardpassedbuilds.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestpassedbuildDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardpassedbuildsSchema.statics.getLatestpassedbuildInfo = function(callback) {
    logger.debug("Enter getLatestpassedbuildDataInfo");
      
    this.find(function(err, passedbuildData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (passedbuildData.length) {
            logger.debug("Exit getLatestpassedbuildDataInfo with providers present");
            callback(null, passedbuildData);
            return;
        } else {
            logger.debug("Exit getLatestpassedbuildDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboardpassedbuilds = mongoose.model('dashboardpassedbuilds', dashboardpassedbuildsSchema);

module.exports = dashboardpassedbuilds;