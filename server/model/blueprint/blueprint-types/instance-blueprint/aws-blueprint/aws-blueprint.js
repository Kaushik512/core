var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var AWSInstanceBlueprintSchema = new Schema({
    keyPairId: {
        type: String,
        required: true,
        trim: true
    },
    subnetId: {
        type: String,
        required: true,
        trim: true
    },
    vpcId: {
        type: String,
        required: true,
        trim: true
    },
    securityGroupIds: {
        type: [String],
        required: true,
        trim: true
    },
    instanceType: {
        type: String,
        //  required: true
    },
    instanceOS: {
        type: String,
        // required: true
    },
    instanceAmiid: {
        type: String,
        //  required: true
    },
    instanceUsername: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        required: true
    }
});

AWSInstanceBlueprintSchema.methods.launch = function(ver, callback) {


};

// static methods
AWSInstanceBlueprintSchema.statics.createNew = function(awsData) {
    var self = this;
    var awsInstanceBlueprint = new self(awsData);
    return awsInstanceBlueprint;
};

var AWSInstanceBlueprint = mongoose.model('AWSInstanceBlueprint', AWSInstanceBlueprintSchema);

module.exports = AWSInstanceBlueprint;