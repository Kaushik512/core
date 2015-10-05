
/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Model which contains provider schema and dao methods.

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');
var ProviderUtil = require('../../../../lib/utils/providerUtil.js');


var Schema = mongoose.Schema;


var azurecloudProviderSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    providerName: {
        type: String,
        required: true,
        trim: true
    },
    providerType: {
        type: String,
        required: true,
        trim: true
    },
    subscriptionId: {
        type: String,
        required: true,
        trim: true
    },
    storageAccount: {
        type: String,
        required: true,
        trim : true
    },
    orgId: {
        type: [String],
        required: true,
        trim: true
    }
});

// Static methods :- 

// creates a new Provider
azurecloudProviderSchema.statics.createNew = function(req,providerData, callback) {
    logger.debug("Enter createNew");
    var providerObj = providerData;
    var that = this;
    logger.debug(JSON.stringify(providerObj));
    var provider = new that(providerObj);
    
    provider.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug(JSON.stringify(aProvider));
        logger.debug("Exit createNew with provider present");
        callback(null, aProvider);
        return;
    });
};

azurecloudProviderSchema.statics.getAzureCloudProviderByName = function(providerName,orgId, callback) {
    logger.debug("Enter getAzureCloudProviderByName");
    this.find({
        "providerName": providerName,
        "orgId": orgId
    }, function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aProvider.length) {
            logger.debug("Exit getAzureCloudProviderByName with provider present");
            callback(null, aProvider[0]);
            return;
        } else {
            logger.debug("Exit getAzureCloudProviderByName with no provider present");
            callback(null, null);
            return;
        }

    });
};

azurecloudProviderSchema.statics.getAzureCloudProviders = function(callback) {
    logger.debug("Enter getAzureCloudProviders");
    this.find({
        "id" : 9
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            logger.debug("Exit getAzureCloudProviders with providers present");
            callback(null, providers);
            return;
        } else {
            logger.debug("Exit getAzureCloudProviders with no providers present");
            callback(null, null);
            return;
        }
    });
};

azurecloudProviderSchema.statics.getAzureCloudProvidersForOrg = function(orgList,callback) {
    logger.debug("Enter getAzureCloudProvidersForOrg");
    var orgIds = [];
        for(var x=0;x<orgList.length;x++){
            orgIds.push(orgList[x]._id);
        }
        logger.debug("org id: ",orgIds);
    this.find({
        orgId : {$in:orgIds}
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            logger.debug("Exit getAzureCloudProvidersForOrg with providers present");
            callback(null, providers);
            return;
        } else {
            logger.debug("Exit getAzureCloudProvidersForOrg with no providers present");
            callback(null, null);
            return;
        }

    });
};

azurecloudProviderSchema.statics.getAzureCloudProviderById = function(providerId, callback) {
    logger.debug("Enter getAzureCloudProviderById");
    this.find({
        "_id": new ObjectId(providerId)
    }, function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aProvider.length) {
            logger.debug("Exit getAzureCloudProviderById with provider present");
            callback(null, aProvider[0]);
            return;
        } else {
            logger.debug("Exit getAzureCloudProviderById with no provider present");
            callback(null, null);
            return;
        }

    });
};

azurecloudProviderSchema.statics.updateAzureCloudProviderById = function(providerId, providerData, callback) {
    logger.debug("Enter updateAzureCloudProviderById");
    this.update({
        "_id": new ObjectId(providerId)
    }, {
        $set: {
            id: providerData.id,
            providerName: providerData.providerName,
            subscriptionId: providerData.azureSubscriptionId,
            storageAccount: providerData.azureStorageAccount,
            providerType: providerData.providerType,
            orgId: providerData.orgId   
        }
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            logger.debug("Exit updateAzureCloudProviderById with no update.");
            callback(err, null);
            return;
        }
        logger.debug("Exit updateAzureCloudProviderById with update success.");
        callback(null, updateCount);
        return;

    });
};

azurecloudProviderSchema.statics.removeAzureCloudProviderById = function(providerId, callback) {
    logger.debug("Enter removeAzureCloudProviderById");
    this.remove({
        "_id": new ObjectId(providerId)
    }, function(err, deleteCount) {
        if (err) {
            logger.debug("Exit removeAzureCloudProviderById with error.");
            callback(err, null);
            return;
        }
        logger.debug("Exit removeAzureCloudProviderById with delete success.");
        callback(null, deleteCount);
        return;

    });
};


azurecloudProviderSchema.statics.getAzureCloudProvidersByOrgId = function(orgId,callback) {
    logger.debug("Enter getAzureCloudProvidersByOrgId");
        logger.debug("org id: ",orgId);
    this.find({
        orgId : orgId
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            logger.debug("Exit getAzureCloudProvidersByOrgId with providers present");
            callback(null, providers);
            return;
        } else {
            logger.debug("Exit getAzureCloudProvidersByOrgId with no providers present");
            callback(null, null);
            return;
        }

    });
};

var azurecloudProvider = mongoose.model('azurecloudprovider', azurecloudProviderSchema);

module.exports = azurecloudProvider;