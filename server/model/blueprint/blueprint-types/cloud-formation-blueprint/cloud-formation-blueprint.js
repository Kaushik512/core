var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;


var DockerBlueprintSchema = new Schema({
    dockercompose: [{
        dockercontainerpathstitle: String,
        dockercontainerpaths: String,
        dockerrepotags: String,
        dockerreponame: String,
        dockerimagename: String,
        dockerlaunchparameters: String
    }],
    dockercontainerpathstitle: {
        type: String,
        trim: true
    },
    dockercontainerpaths: {
        type: String,
        trim: true
    },
    dockerrepotags: {
        type: String,
        trim: true
    },
    dockerreponame: {
        type: String,
        trim: true
    },
    dockerlaunchparameters: {
        type: String,
        trim: true
    },
    dockerimagename: {
        type: String,
        trim: true
    }
});

AWSInstanceBlueprintSchema.methods.launch = function(launchOptions, infraManagerOptions, callback) {


};
var DockerBlueprint = mongoose.model('DockerBlueprint', DockerBlueprintSchema);

module.exports = DockerBlueprint;