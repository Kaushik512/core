var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../dao/schema-validator');


var Schema = mongoose.Schema;


var chefClientExecutionSchema = new Schema({
    instanceId: String,
    runlist: [String],
    timestampStarted: Number,
    timestampUpdated: Number,
    message: String,
    jsonAttribute: Schema.Types.Mixed
});

chefClientExecutionSchema.statics.createNew = function(executionData, callback) {

    var that = this;
    var execution = new that(executionData);
    
    execution.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, execution);
    });
};

var ChefClientExecution = mongoose.model('chefClientExecution', chefClientExecutionSchema);

module.exports = ChefClientExecution;