var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var INFRA_MANAGER_TYPE = {
    CHEF: 'chef',
    PUPPET: 'puppet'
};


var CloudFormationBlueprintSchema = new Schema({
    cloudProviderId: String,
    infraMangerType: String,
    infraManagerId: String,
    infraManagerData: Schema.Types.Mixed,
    templateFile: String,
    stackParameters: [{
        ParameterKey: {
            type: String,
            trim: true
        },
        ParameterValue: {
            type: String,
            trim: true
        }
    }],
    stackName: String
});

AWSInstanceBlueprintSchema.methods.launch = function(launchOptions, infraManagerOptions, callback) {


};
var DockerBlueprint = mongoose.model('DockerBlueprint', DockerBlueprintSchema);

module.exports = DockerBlueprint;