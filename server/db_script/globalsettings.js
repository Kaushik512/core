/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Aug 2015
 */

// This file is like a installer which will install global settings into DB.

var logger = require('_pr/logger')(module);
var GlobalSettings = require('_pr/model/global-settings/global-settings');
var mongoDbConnect = require('_pr/lib/mongodb');
var appConfig = require('_pr/config'); 

var dboptions = {
    host: appConfig.db.host,
    port: appConfig.db.port,
    dbName: appConfig.db.dbName
};
mongoDbConnect(dboptions, function(err) {
    if (err) {
        logger.error("Unable to connect to mongo db >>" + err);
        throw new Error(err);
    } else {
        logger.debug('connected to mongodb - host = %s, port = %s, database = %s', dboptions.host, dboptions.port, dboptions.dbName);
    }
});


var globalSettingsData = {
    "authStrategy": {
        "local": false,
        "externals": true
    },
    "addLDAPUser": true,
    "ldapServer": {
        "url": "54.68.204.110",
        "userName": "Admin",
        "password": "ReleV@ance"
    },
    "kibanaUrl": "",
    "zabbixUrl": "",
    "jenkinsUrl": "",
    "awsUsageUrl": "",
    "awsCostUrl": ""
};
setTimeout(function(){
GlobalSettings.updateGlobalSettings(globalSettingsData, function(err, globalSettings) {
    if (err) {
        logger.debug("Got error while updating Global Settings: ",err);
    }
    logger.debug("Global Settings Updated successfully: ",globalSettings);
    if (globalSettings) {
        logger.debug("Global Settings Updated successfully.");
        return;
    }
});
},2000);
