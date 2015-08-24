var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var CHEFInfraBlueprint = require('../chef-infra-manager/chef-infra-manager');

var Schema = mongoose.Schema;

var openstackInstanceBlueprintSchema = new Schema({
    instanceImageID: {
        type: String,
        required: true,
        trim: true
    },
    flavor: {
        type: String,
        required: true,
        trim: true
    },
    network: {
        type: String,
        required: true,
        trim: true
    },
    securityGroupIds: {
        type: [String],
        required: true,
        trim: true
    },
    subnet: {
        type: String,
        required: true,
         trim: true
    },
    instanceOS: {
        type: String,
        // required: true
    },
    instanceCount:{
        type: String,
    },
    instanceImageName: {
        type: String,
        //  required: true
    },
    instanceUsername: {
        type: String
        //required: true
    },
    infraMangerType: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed
});

openstackInstanceBlueprintSchema.methods.launch = function(ver, callback) {


};

// static methods
openstackInstanceBlueprintSchema.statics.createNew = function(awsData) {
    var self = this;
    logger.debug('In openstackInstanceBlueprintSchema createNew');
    logger.debug(JSON.stringify(awsData));

    var infraManagerBlueprint = CHEFInfraBlueprint.createNew({
            runlist: awsData.runlist
        });
    awsData.infraManagerData = infraManagerBlueprint;


    var awsInstanceBlueprint = new self(awsData);
    return awsInstanceBlueprint;
};

var openstackInstanceBlueprint = mongoose.model('openstackInstanceBlueprint', openstackInstanceBlueprintSchema);

module.exports = openstackInstanceBlueprint;