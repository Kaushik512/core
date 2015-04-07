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
        type: String,
        required: true,
        trim: true
    },
    name: {
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
    var keyPairs = req.body.keyPairs;
    //keyPairs = JSON.parse(keyPairs);
    logger.debug("Create Keypair called:>>>> %s",typeof keyPairs);
    var returnKeyPair = [];
    var count =0;
    if(keyPairs.length > 0){
        //logger.debug("Inside if>>>> ",req.files);
        var inFiles = req.files;
            for(var i=0;i< keyPairs.length;i++){
            var keyPairObj = keyPairs[i];
            //keyPairObj = JSON.parse(keyPairObj);
            logger.debug("Keypair:>>>>>>>>>>>>>>>>>>> ",JSON.stringify(keyPairObj));
            keyPairObj.providerId = providerId;
            keyPairObj.id = 99;
            var that = this;
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
                /*ProviderUtil.saveAwsPemFiles(keyPair,inFiles[i],function(err,flag){
                    if(err){
                        logger.debug("Unable to save pem files.");
                        res.send(500,"Unable to save pem files.");
                        return;
                    }
                });*/
             
                if(keyPairs.length === count){
                    logger.debug("returnKeyPair :>>>>>>>>>>> ",JSON.stringify(returnKeyPair));
                    callback(null,returnKeyPair);
                }
            });
        }
    }
};

function saveKeyPair(keyPair,req){
            keyPair.save(function(err, aKeyPair) {
                logger.debug("Save called......");
                if (err) {
                    logger.error(err);
                    callback(err, null);
                    return ;
                }
                logger.debug("created kepair::::::::::",JSON.stringify(aKeyPair));
                //ProviderUtil.saveAwsPemFiles(keyPair,req);
                return aKeyPair;
            });
}

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
            callback(null, keyPairs);
        } else {
            callback(null, null);
        }

    });
};

awsKeyPairSchema.statics.getAWSKeyPairById = function(keyPairId, callback) {
    this.find({
        "_id": new ObjectId(keyPairId)
    }, function(err, aKeyPair) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aKeyPair.length) {
            callback(null, aKeyPair[0]);
        } else {
            callback(null, null);
        }

    });
};

awsKeyPairSchema.statics.getAWSKeyPairByProviderId = function(providerId, callback) {
    logger.debug("getAWSKeyPairByProviderId....................");
    this.find({
        "providerId": new ObjectId(providerId)
    }, function(err, aKeyPair) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (aKeyPair.length) {
            callback(null, aKeyPair);
        } else {
            callback(null, []);
        }

    });
};

awsKeyPairSchema.statics.updateAWSKeyPairById = function(keyPairId, KeyPairData, callback) {
    
        this.update({
            "_id": new ObjectId(keyPairId)
        }, {
            $set: {
                name: KeyPairData.name,
                accessKey: KeyPairData.region
            }
        }, {
            upsert: false
        }, function(err, updateCount) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, updateCount);

        });
};

awsKeyPairSchema.statics.removeAWSKeyPairById = function(keyPairId, callback) {
    this.remove({
        "_id": new ObjectId(keyPairId)
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, deleteCount);

    });
};

var AWSKeyPair = mongoose.model('AWSKeyPair', awsKeyPairSchema);

module.exports = AWSKeyPair;