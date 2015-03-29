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
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.taskNameValidator
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

var Providers = mongoose.model('Providers', providerSchema);

module.exports = Providers;