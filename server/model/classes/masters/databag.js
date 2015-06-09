/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Model which contains Data Bag related all dao methods.

var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var datBagSchema = new Schema({
	dataBagName:{
		type: String,
		required: true
	},
	dataBagItemId:{
		type: String,
		required: true
	},
	encryptionKey:{
		type: String,
		required: true
	},
	isEncrypted:{
		type: Boolean,
		required: true
	}

});

datBagSchema.statics.saveDataBag = function(aDataBag,callback){
	logger.debug("Enter saveDataBag().");
	var that = this;
	var dataBagModel = new that(aDataBag);
	dataBagModel.save(function(err,aDataBag){
		if(err){
			callback(err,null);
			return;
		}
		callback(null,aDataBag);
		return;
	});
};

datBagSchema.statics.getDataBagEncryptionInfo = function(dataBagName,dataBagItemId,callback){
	logger.debug("Enter getDataBagEncryptionInfo().");
	this.find({
		"dataBagName" : dataBagName,
		"dataBagItemId" : dataBagItemId
	},function(err,aDataBag){
		if(err){
			callback(err,null);
			return;
		}
		callback(null,aDataBag[0]);
		return;
	});
};

datBagSchema.statics.removeDataBagById = function(dataBagId, callback) {
    logger.debug("Enter removeDataBagById");
    this.remove({
        "_id": new ObjectId(dataBagId)
    }, function(err, deleteCount) {
        if (err) {
            logger.debug("Exit removeDataBagById with error");
            callback(err, null);
            return;
        }
        logger.debug("Exit removeDataBagById with success");
        callback(null, deleteCount);

    });
};

var DataBagModel = mongoose.model('DataBagModel', datBagSchema);

module.exports = DataBagModel;