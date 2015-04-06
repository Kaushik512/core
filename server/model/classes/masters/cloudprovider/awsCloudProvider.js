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
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.providerNameValidator
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
    }
});

// Static methods :- 

// creates a new Provider
awsProviderSchema.statics.createNew = function(providerData, callback) {
    
    var providerObj = providerData;
    var that = this;
    var provider = new that(providerObj);
    provider.save(function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, aProvider);
    });
};

awsProviderSchema.statics.getAWSProviders = function(callback) {
    logger.debug("get all providers.");
    this.find({
        "id" : 9
    }, function(err, providers) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (providers.length) {
            callback(null, providers);
        } else {
            callback(null, null);
        }

    });
};

awsProviderSchema.statics.getAWSProviderById = function(providerId, callback) {
    this.find({
        "_id": new ObjectId(providerId)
    }, function(err, aProvider) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aProvider.length) {
            callback(null, aProvider[0]);
        } else {
            callback(null, null);
        }

    });
};

awsProviderSchema.statics.updateAWSProviderById = function(providerId, providerData, callback) {
    
        this.update({
            "_id": new ObjectId(providerId)
        }, {
            $set: {
                name: providerData.name,
                accessKey: providerData.accessKey,
                secretKey: providerData.secretKey,
                providerType: providerData.providerType
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, updateCount);

        });
};

awsProviderSchema.statics.removeAWSProviderById = function(providerId, callback) {
    this.remove({
        "_id": new ObjectId(providerId)
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, deleteCount);

    });
};

var AWSProvider = mongoose.model('AWSProvider', awsProviderSchema);

module.exports = AWSProvider;