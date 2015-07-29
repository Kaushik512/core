var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var CloundFormationChefInfraManagerSchema = new Schema({
    runlist: [{
        type: String,
        required: true
    }]
});


CloundFormationChefInfraManagerSchema.statics.createNew = function(chefData) {
    var self = this;

    var chefInfraManager = new self({
        runlist: chefData.runlist
    });
    return chefInfraManager;
};

var CloundFormationChefInfraManagerSchema = mongoose.model('cloudFormationChefInfraManager', CloundFormationChefInfraManagerSchema);

module.exports = CloundFormationChefInfraManagerSchema;