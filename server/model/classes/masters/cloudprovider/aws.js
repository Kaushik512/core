var logger = require('../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var providerTypeSchema = require('./providerTypeSchema');


var awsProviderSchema = providerTypeSchema.extend({
    accessKey: String,
    secretKey: String,
    regions: []
});

// Instance Method 
awsProviderSchema.methods.execute = function(userName, onExecute) {
    

};

var AWSProvider = mongoose.model('AWSProvider', awsProviderSchema);

module.exports = AWSProvider;