var logger = require('../../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var ChefTask = require('./taskTypeChef');
var JenkinsTask = require('./taskTypeJenkins');

var Schema = mongoose.Schema;

var PROVIDER_TYPE = {
    AWS: 'aws',
    AZURE: 'azure'
}

var MASTERS_ID = "9";


var ProviderSchema = new Schema({
    id: String,
    type: {
        type: String,
        required: true,
        trim: true
    },
    
   
});