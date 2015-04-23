var logger = require('../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var awsProviderSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    providerName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    providerType: {
        type: String,
        required: true,
        trim: true
    },
    accessKey: {
        type: String,
        required: true,
        trim: true
    },
    secretKey: {
        type: String,
        required: true,
        trim: true
    },
    orgId: {
        type: [String],
        required: true,
        trim: true
    }
});

// Static methods :- 

// creates a new Provider
awsProviderSchema.statics.createNew = function(providerData, callback) {
    logger.debug("Enter createNew");
    var providerObj = providerData;
    var that = this;
    var provider = new that(providerObj);
    provider.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew with provider present");
        callback(null, aProvider);
    });
};

awsProviderSchema.statics.getAWSProviders = function(callback) {
    logger.debug("Enter getAWSProviders");
    this.find({
        "id" : 9
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            logger.debug("Exit getAWSProviders with providers present");
            callback(null, providers);
        } else {
            logger.debug("Exit getAWSProviders with no providers present");
            callback(null, null);
        }

    });
};

awsProviderSchema.statics.getAWSProvidersForOrg = function(orgList,callback) {
    logger.debug("Enter getAWSProvidersForOrg");
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
            logger.debug("Exit getAWSProvidersForOrg with providers present");
            callback(null, providers);
        } else {
            logger.debug("Exit getAWSProvidersForOrg with no providers present");
            callback(null, null);
        }

    });
};

awsProviderSchema.statics.getAWSProviderById = function(providerId, callback) {
    logger.debug("Enter getAWSProviderById");
    this.find({
        "_id": new ObjectId(providerId)
    }, function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aProvider.length) {
            logger.debug("Exit getAWSProviderById with provider present");
            callback(null, aProvider[0]);
        } else {
            logger.debug("Exit getAWSProviderById with no provider present");
            callback(null, null);
        }

    });
};

awsProviderSchema.statics.updateAWSProviderById = function(providerId, providerData, callback) {
    logger.debug("Enter updateAWSProviderById");
    this.update({
        "_id": new ObjectId(providerId)
    }, {
        $set: {
            id: providerData.id,
            providerName: providerData.providerName,
            accessKey: providerData.accessKey,
            secretKey: providerData.secretKey,
            providerType: providerData.providerType
        }
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            logger.debug("Exit updateAWSProviderById with no update.");
            callback(err, null);
            return;
        }
        logger.debug("Exit updateAWSProviderById with update success.");
        callback(null, updateCount);

    });
};

awsProviderSchema.statics.removeAWSProviderById = function(providerId, callback) {
    logger.debug("Enter removeAWSProviderById");
    this.remove({
        "_id": new ObjectId(providerId)
    }, function(err, deleteCount) {
        if (err) {
            logger.debug("Exit removeAWSProviderById with error.");
            callback(err, null);
            return;
        }
        logger.debug("Exit removeAWSProviderById with delete success.");
        callback(null, deleteCount);

    });
};

var AWSProvider = mongoose.model('AWSProvider', awsProviderSchema);

module.exports = AWSProvider;