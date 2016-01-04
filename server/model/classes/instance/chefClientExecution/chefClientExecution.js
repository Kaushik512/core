/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('_pr/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');


var Schema = mongoose.Schema;

var chefClientExecutionSchema = new Schema({
    instanceId: String,
    timestampStarted: Number,
    timestampUpdated: Number,
    message: String,
    jsonAttribute: Schema.Types.Mixed
});

chefClientExecutionSchema.methods.update = function(message, jsonAttribute, callback) {
    var self = this;
    self.message = message;
    self.jsonAttribute = jsonAttribute;
    self.timestampUpdated = new Date().getTime();
    self.save(function(err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, self);
    });
};


chefClientExecutionSchema.statics.createNew = function(executionData, callback) {

    var that = this;

    var execution = new that(executionData);
    executionData.timestampStarted = new Date().getTime();
    execution.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, execution);
    });
};

chefClientExecutionSchema.statics.getExecutionById = function(executionId, callback) {

    this.find({
        "_id": new ObjectId(executionId)
    }, function(err, chefClientExecution) {
        if (err) {
            callback(err, null);
            return;
        }
        if (chefClientExecution.length) {
            callback(null, chefClientExecution[0]);
        } else {
            callback(null, null);
        }
    });
};

var ChefClientExecution = mongoose.model('chefClientExecution', chefClientExecutionSchema);

module.exports = ChefClientExecution;
