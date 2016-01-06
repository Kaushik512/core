/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Jan 2016
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');
var schemaValidator = require('_pr/model/utils/schema-validator');

// File which contains ldap DB schema and DAO methods. 

var Schema = mongoose.Schema;

var LDAPUserSchema = new Schema({
    host: String,
    port: String,
    adminUser: String,
    adminPass: String,
    baseDn: String,
    ou: String
});

// Get all ldap user informations.
LDAPUserSchema.statics.getLdapUser = function(callback) {
    this.find(function(err, users) {
        if (err) {
            logger.debug("Got error while fetching userData: ", err);
            callback(err, null);
        }
        logger.debug("Got ldap user: ", JSON.stringify(users));
        callback(null, users);
    });
};

// Save all ldap user informations.
LDAPUserSchema.statics.createNew = function(userData, callback) {
    var anUser = new this(userData);
    anUser.save(function(err, user) {
        if (err) {
            logger.debug("Got error while creating user: ", err);
            callback(err, null);
        }
        logger.debug("Creating user: ", JSON.stringify(user));
        callback(null, user);
    });
};

var LDAPUser = mongoose.model("ldapUser", LDAPUserSchema);
module.exports = LDAPUser;
