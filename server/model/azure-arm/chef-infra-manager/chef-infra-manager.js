var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var ARMChefInfraManagerSchema = new Schema({
    runlist: [{
        type: String,
        required: true
    }]
});


ARMChefInfraManagerSchema.statics.createNew = function(chefData) {
    var self = this;

    var chefInfraManager = new self({
        runlist: chefData.runlist
    });
    return chefInfraManager;
};

var ARMChefInfraManager = mongoose.model('ARMChefInfraManager', ARMChefInfraManagerSchema);

module.exports = ARMChefInfraManager;