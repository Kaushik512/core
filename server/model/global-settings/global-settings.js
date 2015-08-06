/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');

// File which contains GobalSettings DB schema and DAO methods. 

var Schema = mongoose.Schema;

var GlobalSettingsSchema = new Schema({
    authStrategy: {
        local: Boolean,
        externals: Boolean
    },
    addLDAPUser: Boolean,
    ldapServer: {
        url: String,
        userName: String,
        password: String
    },
    kibanaUrl: String,
    zabbixUrl: String,
    jenkinsUrl: String,
    awsUrl: String,
    awsMonitorUrl: String

});

// Get all GobalSettings informations.
GlobalSettingsSchema.statics.getGolbalSettings = function(callback) {
    this.find(function(err, globalSettings) {
        if (err) {
            logger.debug("Got error while fetching GobalSettings: ", err);
            callback(err, null);
        }
        if (globalSettings) {
            logger.debug("Got GobalSettings: ", JSON.stringify(globalSettings));
            callback(null, globalSettings);
        }
    });
};

// Save all GobalSettings informations.
GlobalSettingsSchema.statics.createNew = function(globalSettingsData, callback) {
    var gSettings = new this(globalSettingsData);
    gSettings.save(function(err, globalSettings) {
        if (err) {
            logger.debug("Got error while creating GobalSettings: ", err);
            callback(err, null);
        }
        if (globalSettings) {
            logger.debug("Creating GobalSettings: ", JSON.stringify(globalSettings));
            callback(null, globalSettings);
        }
    });
};

// Save all GobalSettings informations.
GlobalSettingsSchema.statics.updateSettings = function(gSettingsId, globalSettingsData, callback) {
	logger.debug("Going to Update settings data: ",JSON.stringify(globalSettingsData));
    this.update({
        "_id": gSettingsId
    }, {
        $set: {
            authStrategy: globalSettingsData.authStrategy,
            addLDAPUser: globalSettingsData.addLDAPUser,
            ldapServer: globalSettingsData.ldapServer,
            kibanaUrl: globalSettingsData.kibanaUrl,
            zabbixUrl: globalSettingsData.zabbixUrl,
            jenkinsUrl: globalSettingsData.jenkinsUrl,
            awsUrl: globalSettingsData.awsUrl,
            awsMonitorUrl: globalSettingsData.awsMonitorUrl
        }
    }, {
        upsert: false
    }, function(err, globalSettings) {
        if (err) {
            logger.debug("Got error while creating GobalSettings: ", err);
            callback(err, null);
        }
        if (globalSettings) {
            logger.debug("Updating GobalSettings: ", JSON.stringify(globalSettings));
            callback(null, globalSettings);
        }
    });
};

// Get all GobalSettings informations.
GlobalSettingsSchema.statics.getGolbalSettingsById = function(gSettingsId, callback) {
    this.find({
        "_id": gSettingsId
    }, function(err, globalSettings) {
        if (err) {
            logger.debug("Got error while fetching GobalSettings: ", err);
            callback(err, null);
        }
        if (globalSettings) {
            logger.debug("Got GobalSettings: ", JSON.stringify(globalSettings[0]));
            callback(null, globalSettings[0]);
        }
    });
};

var GobalSettings = mongoose.model("globalSettings", GlobalSettingsSchema);
module.exports = GobalSettings;
