var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('./../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');
var logger = require('../../../lib/logger')(module);