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
    "kibanaUrl": "http://52.8.215.253/#/dashboard/KPI-CAT-NGINX?embed&_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-4h,mode:quick,to:now))&_a=(filters:!(),panels:!((col:1,id:'ACCESS-LAYER-Performance(NGINX)',row:1,size_x:4,size_y:2,type:visualization),(col:5,id:'ACCESS-LAYER-UPTIME(NGINX)',row:1,size_x:4,size_y:2,type:visualization),(col:9,id:'ACCESS-LAYER-RESPONSE(NGINX)',row:1,size_x:4,size_y:2,type:visualization),(col:1,id:CAT-UPTIME,row:3,size_x:12,size_y:2,type:visualization),(col:1,id:CAT-BOOTSTRAP-PERDAY,row:19,size_x:12,size_y:3,type:visualization),(col:1,id:CAT-LOGLEVEL-Percent,row:5,size_x:12,size_y:3,type:visualization),(col:1,id:CAT-ERRORS,row:8,size_x:12,size_y:3,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'*')),title:KPI-CAT-NGINX)",
    "zabbixUrl": "http://54.67.35.103:8008/index.html",
    "jenkinsUrl": "http://jenkins.rlcatalyst.com",
    "awsUsageUrl": "http://54.67.35.103:3031/Awsusage",
    "awsCostUrl": "http://54.67.35.103:3030/Infrah",
    "awsNotificationUrl": "http://54.67.35.103:4000/events#"
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
