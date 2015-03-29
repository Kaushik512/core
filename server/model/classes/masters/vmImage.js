var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;



var imageSchema = new Schema({
    providerId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
    },
    imageId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.bgIdValidator
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.projIdValidator
    },
    virtualizationType: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.envIdValidator
    }
});
