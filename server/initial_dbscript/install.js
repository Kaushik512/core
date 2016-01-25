/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Jan 2016
 */

// This file is like a installer which will install global settings into DB.

var logger = require('_pr/logger')(module);
var GlobalSettings = require('_pr/model/global-settings/global-settings');
var mongoDbConnect = require('_pr/lib/mongodb');
var appConfig = require('_pr/config');
var d4dModel = require('../model/d4dmasters/d4dmastersmodel.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var permissionsetsdao = require('_pr/model/dao/permissionsetsdao.js');
var userRole = require('_pr/model/user-roles.js');
var LDAPUser = require('../model/ldap-user/ldap-user.js');

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

// to modify ldap values.
    var modifyLdap = false;

    LDAPUser.getLdapUser(function(err, data) {
        if (err) {
            logger.error("Failed to get ldapUser: ", err);
            return;
        }
        if (!data.length) {
            // Create Ldap User
            // provide ldap information here.
            var ldapUser = {
                host: '',
                port: 0,
                adminUser: '',
                adminPass: '',
                baseDn: '',
                ou: ''
            };
            LDAPUser.createNew(ldapUser, function(err, data) {
                if (err) {
                    logger.error("Failed to save ldapUser: ", err);
                    return;
                }
                logger.debug("Ldap User saved successfully.");
            });
            // End Create Ldap User
        } else if (modifyLdap) {
            
            // Update Ldap User

            // provide ldap information here.
            var ldapUser = {
                host: 'hghhh',
                port: 0,
                adminUser: 'ffsdfdffd',
                adminPass: '',
                baseDn: '',
                ou: ''
            };
            LDAPUser.getLdapUser(function(err, data) {
                if (err) {
                    logger.error("Failed to get ldapUser: ", err);
                    return;
                }
                if (data.length) {
                    LDAPUser.updateLdapUser(data[0]._id,ldapUser, function(err, data) {
                        if (err) {
                            logger.error("Failed to update ldapUser: ", err);
                            return;
                        }
                        logger.debug("Ldap User updated successfully.");
                    });
                }else{
                    logger.info("No ldap user found to update.");
                }
            });

            // End Update Ldap User
        } else {
            logger.info("LDAP User already exist.If you want to modify then please change the modifyLdap flag value to true and try.");
        }
    });