var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('_pr/model/utils/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;



var AutoScaleInstanceSchema = new Schema({
    autoScaleResourceId: {
        type: String,
        required: true,
        trim: true
    },
    awsInstanceId: {
        type: String,
        required: true,
        trim: true,
    }
});






// Static methods :- 

// creates a new task
AutoScaleInstanceSchema.statics.createNew = function(data, callback) {

    var cfObj = {
        autoScaleResourceId: data.autoScaleResourceId,
        awsInstanceId: data.awsInstanceId
    };

    var that = this;
    var cf = new that(cfObj);

    cf.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};

// creates a new entry
AutoScaleInstanceSchema.statics.findByAutoScaleResourceId = function(autoScaleResourceId, callback) {
    if (!autoScaleResourceId) {
        process.nextTick(function() {
            callback(new Error("Invalid autoScaleResourceId"));
        });
        return;
    }
    var queryObj = {
        autoScaleResourceId: autoScaleResourceId,
    }

    this.find(queryObj, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};




// remove task by id
AutoScaleInstanceSchema.statics.removeById = function(id, callback) {
    this.remove({
        "_id": new ObjectId(cfId)
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        callback(null, deleteCount);

    });
};

// remove task by id
AutoScaleInstanceSchema.statics.removeByAutoScaleResourceAndInstanceId = function(resourceId, instanceId, callback) {
    if (!(resourceId && instanceId)) {
        process.nextTick(function() {
            callback(new Error("Invalid resourceId and instanceId"));
        });
        return;
    }
    this.remove({
        "autoScaleResourceId": resourceId,
        "awsInstanceId": instanceId
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        callback(null, deleteCount);

    });
};






var AutoScaleInstance = mongoose.model('AutoScaleInstance', AutoScaleInstanceSchema);

module.exports = AutoScaleInstance;