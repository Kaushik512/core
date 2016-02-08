/*
Copyright [2016] [Arabinda Behera]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


// This file act as a Model which contains provider schema and dao methods.

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var dashboardalertsSchema = new Schema({
    totalalertcount: {
        type: Number,
        required: true
    },
    timestamp:{
        type: Number,
        required: true
    }
});

// creates a new Provider
dashboardalertsSchema.statics.createNew = function(dashboardalertsData, callback) {
    logger.debug("Enter createNew dashboard");
    //var dashboardProviderObj = dashboardProviderData;
    var that = this;
    var dashboardalerts = new that({
        totalalertcount: dashboardalertsData,
        timestamp: new Date().getTime(),
    });
    dashboardalerts.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with getLatestalertDataInfo present");
        callback(null, aProvider);
        return;
    });
};

dashboardalertsSchema.statics.getLatestalertInfo = function(callback) {
    logger.debug("Enter getLatestalertDataInfo");
      
    this.find(function(err, alertData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (alertData.length) {
            logger.debug("Exit getLatestalertDataInfo with providers present");
            callback(null, alertData);
            return;
        } else {
            logger.debug("Exit getLatestalertDataInfo with no providers present");
            callback(null, null);
            return;
        }
    }).sort({_id:-1}).limit(1);
};

var dashboardalerts = mongoose.model('dashboardalerts', dashboardalertsSchema);

module.exports = dashboardalerts;