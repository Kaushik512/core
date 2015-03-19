var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../../lib/logger')(module);
var schemaValidator = require('../../../schema-validator');

var Schema = mongoose.Schema;

var deploySchema = new Schema({
    taskId: String,
});

// Get Nodes list
AppCardSchema.methods.build = function() {

};


module.exports = buildSchema;