/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Model which contains key pair schema and all dao methods.

var logger = require('../../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');
var ProviderUtil = require('../../../../lib/utils/providerUtil.js');

var Schema = mongoose.Schema;


var awsKeyPairSchema = new Schema({
    id: {
        type: Number
        ,
        required: true,
        trim: true
    },
    keyPairName: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.nameValidator
    },
    region: {
        type: String,
        required: true,
        trim: true
    },
    providerId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.idValidator
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    }
});

// Static methods :- 

// creates a new Provider
awsKeyPairSchema.statics.createNew = function(req,providerId,callback) {
    logger.debug("Enter createNew for keyPair.");
    var keyPairs = [];
    var keyPairNames = req.body.keyPairName;
    var regions = req.body.region;
    var fileNames = req.body.fileName;
    if(typeof keyPairNames === "object"){
        logger.debug("Inside array>>>>");
        for(var p=0; p< keyPairNames.length; p++){
            var keyPairs1= {
            keyPairName: keyPairNames[p],
            region: regions[p],
            fileName: fileNames[p]
          };
          keyPairs.push(keyPairs1);
        }
    }else{
    var keyPairs1= {
        keyPairName: req.body.keyPairName,
        region: req.body.region,
        fileName: req.body.fileName
        };
        keyPairs.push(keyPairs1);
    }
    logger.debug("Create Keypair called:>>>> %s",keyPairs);
    var returnKeyPair = [];
    var files = [];
    var count =0;
    if(keyPairs){
        logger.debug("Inside if>>>> ",typeof keyPairs);
        var inFiles = req.files.fileObject;
        console.log("Incomming files:  ",typeof inFiles.length);
        if(typeof inFiles.length === 'undefined'){
            logger.debug("Inside undefined...")
            files.push(inFiles);
        }else{
            for(var x=0; x< inFiles.length; x++){
                files.push(inFiles[x]);
            }
        }
        logger.debug("Files>>>>>>>>>>>>>>>>>> ",JSON.stringify(files));
        var that = this;
        for(var i=0;i< keyPairs.length;i++){
            (function (count1){
            var keyPairObj = keyPairs[count1];
            keyPairObj.providerId = providerId;
            keyPairObj.id = 99;
            
            var keyPair = new that(keyPairObj);
            keyPair.save(function(err, aKeyPair) {
                logger.debug("Save called......");
                if (err) {
                    logger.error(err);
                    callback(err, null);
                    return ;
                }
                logger.debug("created kepair::::::::::",JSON.stringify(aKeyPair));

                returnKeyPair.push(keyPair);
                count++;
                ProviderUtil.saveAwsPemFiles(keyPair,files[count1],function(err,flag){
                    if(err){
                        logger.debug("Unable to save pem files.");
                        res.send(500,"Unable to save pem files.");
                        return;
                    }
                });
                
                if(keyPairs.length === count){
                    logger.debug("Exit createNew with keyPair present");
                    callback(null,returnKeyPair);
                }
            });
          })(i);
        }
    }
};


awsKeyPairSchema.statics.getKeyPairs = function(callback) {
    logger.debug("get all KeyPair.");
    this.find({
        "id" : 99
    }, function(err, keyPairs) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (keyPairs.length) {
            logger.debug("Exit getKeyPairs with keyPair present");
            callback(null, keyPairs);
        } else {
            logger.debug("Exit getKeyPairs with no keyPair present");
            callback(null, null);
        }

    });
};

awsKeyPairSchema.statics.getAWSKeyPairById = function(keyPairId, callback) {
    logger.debug("Enter getAWSKeyPairById");
    this.find({
        "_id": new ObjectId(keyPairId)
    }, function(err, aKeyPair) {
        if (err) {
            logger.error(err);
            logger.debug("Exit getAWSKeyPairById with error");
            callback(err, null);
            return;
        }
        if (aKeyPair.length) {
            logger.debug("Exit getAWSKeyPairById with keyPair present");
            callback(null, aKeyPair[0]);
        } else {
            logger.debug("Exit getAWSKeyPairById with keyPair present");
            callback(null, null);
        }

    });
};

awsKeyPairSchema.statics.getAWSKeyPairByProviderId = function(providerId, callback) {
    logger.debug("Enter getAWSKeyPairByProviderId");
    this.find({
        "providerId": new ObjectId(providerId)
    }, function(err, aKeyPair) {
        if (err) {
            logger.error(err);
            logger.debug("Exit getAWSKeyPairByProviderId with error");
            callback(err, null);
            return;
        }
        if (aKeyPair.length) {
            logger.debug("Exit getAWSKeyPairByProviderId with keyPair present");
            callback(null, aKeyPair);
        } else {
            logger.debug("Exit getAWSKeyPairByProviderId with no keyPair present");
            callback(null, []);
        }

    });
};

awsKeyPairSchema.statics.updateAWSKeyPairById = function(keyPairId, KeyPairData, callback) {
    logger.debug("Enter updateAWSKeyPairById");
    this.update({
        "_id": new ObjectId(keyPairId)
    }, {
        $set: {
            name: KeyPairData.keyPairName,
            accessKey: KeyPairData.region
        }
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            logger.debug("Exit updateAWSKeyPairById with error");
            callback(err, null);
            return;
        }
        logger.debug("Exit updateAWSKeyPairById with success");
        callback(null, updateCount);

    });
};

awsKeyPairSchema.statics.removeAWSKeyPairById = function(keyPairId, callback) {
    logger.debug("Enter removeAWSKeyPairById");
    this.remove({
        "_id": new ObjectId(keyPairId)
    }, function(err, deleteCount) {
        if (err) {
            logger.debug("Exit removeAWSKeyPairById with error");
            callback(err, null);
            return;
        }
        logger.debug("Exit removeAWSKeyPairById with success");
        callback(null, deleteCount);

    });
};

var AWSKeyPair = mongoose.model('AWSKeyPair', awsKeyPairSchema);

module.exports = AWSKeyPair;