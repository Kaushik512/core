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
var schemaValidator = require('./schema-validator');



var Schema = mongoose.Schema;

var permissionsetsschema = new Schema({
    roleid: {
        type: String
    },
    rolename: {
        type: String
    },
    permissions: [{
        category: {
            type: String
        },
        type: {
            type: String
        },
        access: [{
            type: String
        }]
    }]
});

var Permissionsets = mongoose.model('permissionsets', permissionsetsschema);

var PermissionsetsDao = function() {
    this.getPermissionSet = function(roles, callback) {
        logger.debug('Entering getPermissionSet. roles rcvd:' + roles);
        roles = roles.split(',');
        Permissionsets.find({
            rolename: {
                $in: roles
            }
        }, function(err, data) {
            if (!err) {
                logger.debug('Exiting getPermissionSet');
                callback(null, data);
            } else {
                logger.debug('Permissionsets Err : ' + err);
                logger.debug('Exiting on error getPermissionSet');
                callback(err, null);
                return;
            }
        });
    };

};

module.exports = new PermissionsetsDao();
