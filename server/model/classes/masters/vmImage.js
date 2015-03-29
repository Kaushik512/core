var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;



var imageSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    providerId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.providerIdValidator
    },
    imageId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.imageIdValidator
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
});

imageSchema.statics.createNew = function(imageData, callback) {

    var that = this;
    var vmimage = new that(imageData);
    vmimage.save(function(err, imageData) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, imageData);
    });
};

imageSchema.statics.getImages = function(callback) {
    logger.debug("get all providers.");
    this.find({
        "id" : 22
    }, function(err, images) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (images.length) {
            callback(null, images);
        } else {
            callback(null, null);
        }

    });
};

imageSchema.statics.getImageById = function(imageId, callback) {
    this.find({
        "_id": new ObjectId(imageId)
    }, function(err, anImage) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (anImage.length) {
            callback(null, anImage[0]);
        } else {
            callback(null, null);
        }

    });
};

imageSchema.statics.updateImageById = function(imageId, imageData, callback) {

    this.update({
        "_id": new ObjectId(imageId)
    }, {
        $set: {
            id: 22,
            providerId: imageData.providerId,
            imageId: imageData.imageId,
            name: imageData.name
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

imageSchema.statics.removeImageById = function(imageId, callback) {
    this.remove({
        "_id": new ObjectId(imageId)
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, deleteCount);

    });
};

imageSchema.statics.getImageByProviderId = function(providerId, callback) {
    this.find({
        "providerId": providerId
    }, function(err, anImage) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (anImage.length) {
            callback(null, anImage[0]);
        } else {
            callback(null, null);
        }

    });
};

var VMImage = mongoose.model('VMImage', imageSchema);

module.exports = VMImage;