var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../lib/logger')(module);
var schemaValidator = require('../../dao/schema-validator');

var Build = require('./build/build.js');

var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
    },
    bgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.bgIdValidator
    },
    projectId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.projIdValidator
    },
    iconpath: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.appCardNameValidator
    },
    users: [{
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    build: {
        type: Schema.ObjectId,
        ref: Build.schema
    }

});

// static methods
ApplicationSchema.statics.createNew = function(appData, callback) {
    logger.debug("Enter create new application");
    var self = this;
    var application = new self(appData);

    application.save(function(err, data) {
        if (err) {
            logger.error("create Application Failed", err, appData);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew application");
        callback(null, data);
    });
};

ApplicationSchema.statics.getAppCardsByOrgBgAndProjectId = function(orgId, bgId, projectId, userName, callback) {
    logger.debug("Enter getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, userName);
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projectId,
    }
    if (userName) {
        queryObj.users = userName;
    }
    this.find(queryObj, function(err, applications) {
        if (err) {
            logger.error("Failed to getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, userName, err);
            callback(err, null);
            return;
        }

        logger.debug("Exit getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, userName);
        callback(null, applications);
    });
};

var Application = mongoose.model('application', ApplicationSchema);

module.exports = Application;