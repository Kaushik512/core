var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;


var DockerBlueprintSchema = new Schema({
    dockerCompose: [{
        dockercontainerpathstitle: String,
        dockercontainerpaths: String,
        dockerrepotags: String,
        dockerreponame: String,
        dockerimagename: String,
        dockerlaunchparameters: String
    }],
    dockerContainerPathsTitle: {
        type: String,
        trim: true
    },
    dockerContainerPaths: {
        type: String,
        trim: true
    },
    dockerRepoTags: {
        type: String,
        trim: true
    },
    dockerRepoName: {
        type: String,
        trim: true
    },
    dockerLaunchParameters: {
        type: String,
        trim: true
    },
    dockerImageName: {
        type: String,
        trim: true
    }
});

DockerBlueprintSchema.statics.createNew = function(dockerData) {
    var self = this;
    dockerBlueprint = new self(dockerData);
    return dockerBlueprint;
};

var DockerBlueprint = mongoose.model('DockerBlueprint', DockerBlueprintSchema);

module.exports = DockerBlueprint;