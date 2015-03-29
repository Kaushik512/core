var logger = require('../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;



var Schema = mongoose.Schema;


var providerTypeSchema = new Schema({
    providerType: String
});


module.exports = providerTypeSchema;