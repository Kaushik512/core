var logger = require('../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var AWSProvider = require('./aws');
var AWS = require('./azure');

var Schema = mongoose.Schema;

var PROVIDER_TYPE = {
    AWS_PROVIDER: 'aws',
    AZURE_PROVIDER: 'azure'
}



var providerSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    providerType: {
        type: String,
        required: true,
        trim: true
    },
    providerConfig: Schema.Types.Mixed,
});

// Static methods :- 

// creates a new Provider
providerSchema.statics.createNew = function(providerData, callback) {
    var providerConfig;
    if (providerData.providerType === PROVIDER_TYPE.AWS_PROVIDER) {
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>> %s//////////",providerData.regions);
        providerConfig = new AWSProvider({
            providerType: providerData.providerType,
            accessKey: providerData.accessKey,
            secretKey: providerData.secretKey,
            regions: providerData.regions
            /*regions:[{"US":"us-west-2","IND":"in-west-1",
            keyPairs:[{"keyPairs1":"value1"},{"keyPairs2":"value2"}]
            }]*/
        });
    } else {
        callback({
            message: "Invalid Provider Type"
        }, null);
        return;
    }
    var providerObj = providerData;
    logger.debug("providerConfig>>>>>>>>>>>>>>>>>>>>>>>............%s",providerConfig.regions);
    providerObj.providerConfig = providerConfig;

    var that = this;
    var provider = new that(providerObj);
    provider.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, provider);
    });
};

providerSchema.statics.getProviders = function(callback) {
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

providerSchema.statics.getProviderById = function(providerId, callback) {
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

providerSchema.statics.updateProviderById = function(providerId, providerData, callback) {
    var providerConfig;
    if (providerData.providerType === PROVIDER_TYPE.AWS_PROVIDER) {
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>>",providerData.regions);
        providerConfig = new AWSProvider({
            providerType: providerData.providerType,
            accessKey: providerData.accessKey,
            secretKey: providerData.secretKey,
            regions: providerData.regions
        });
    } else {
        callback({
            message: "Invalid Provider Type"
        }, null);
        return;
    }


    this.update({
        "_id": new ObjectId(providerId)
    }, {
        $set: {
            name: providerData.name,
            providerConfig: providerConfig,
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

providerSchema.statics.removeProviderById = function(providerId, callback) {
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

var Providers = mongoose.model('Providers', providerSchema);

module.exports = Providers;