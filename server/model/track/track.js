/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Aug 2015
 */

var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');

// File which contains Track DB schema and DAO methods. 

var Schema = mongoose.Schema;

var TrackSchema = new Schema({
    itemUrls: [{
        name: String,
        url: String,
        description: String,
        childItem: [{
            name: String,
            url: String
        }]
    }],
    type: String
});

// Get all Track informations.
TrackSchema.statics.getTracks = function(callback) {
    this.find(function(err, tracks) {
        if (err) {
            logger.debug("Got error while fetching Track: ", err);
            callback(err, null);
        }
        if (tracks) {
            logger.debug("Got Tracks: ", JSON.stringify(tracks));
            callback(null, tracks);
        }
    });
};

// Save all Track informations.
TrackSchema.statics.createNew = function(trackData, callback) {
    var track = new this(trackData);
    track.save(function(err, tracks) {
        if (err) {
            logger.debug("Got error while creating Track: ", err);
            callback(err, null);
        }
        if (tracks) {
            logger.debug("Creating Track: ", JSON.stringify(tracks));
            callback(null, tracks);
        }
    });
};

// Update all Track informations.
TrackSchema.statics.updateTrack = function(trackId, trackData, callback) {

    logger.debug("Update Track" , JSON.stringify(trackData));
    logger.debug(trackData.description);
    if(!trackData.childItem) {
        trackData.childItem = [];
    }
    this.update({
        "_id": new ObjectId(trackId),
        "itemUrls._id": new ObjectId(trackData.itemId)
    }, {
        $set: {
            "itemUrls.$.name": trackData.name,
            "itemUrls.$.url": trackData.url,
            "itemUrls.$.description": trackData.description,
            "itemUrls.$.childItem": trackData.childItem
        }
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            logger.debug("Got error while creating tracks: ", err);
            callback(err, null);
        }
        logger.debug("updated data",JSON.stringify(trackData));
        callback(null, updateCount);

    });
};

// Get all Track informations.
TrackSchema.statics.getTrackById = function(trackId, callback) {
    this.find({
        "_id": new ObjectId(trackId)
    }, function(err, tracks) {
        if (err) {
            logger.debug("Got error while fetching Track: ", err);
            callback(err, null);
            return;
        }
        if (tracks) {
            logger.debug("Got Track: ", JSON.stringify(tracks[0]));
            callback(null, tracks[0]);
        }
    });
};

// Remove Track informations.
TrackSchema.statics.removeTracks = function(trackId, itemUrlId, callback) {
    logger.debug("removing",itemUrlId);
    logger.debug("trackId",trackId);
    logger.debug("itemUrlId",itemUrlId);
    this.update({
        "_id": trackId
    }, {
        $pull: {
            itemUrls: {
                "_id": new ObjectId(itemUrlId),
            }
        }
    }, {
        upsert: false
    }, function(err, tracks) {
        if (err) {
            logger.debug("Got error while removing Tracks: ", err , itemUrlId);
            callback(err, null);
        }
        if (tracks) {
            logger.debug("Remove Success....");
            callback(null, tracks);
        }
    });
};

//find entry by type.
TrackSchema.statics.getTrackByType = function(trackType, callback) {
    this.find({
        "type": trackType
    }, function(err, tracks) {
        if (err) {
            logger.debug("Got error while fetching Track: ", err);
            callback(err, null);
            return;
        }
        if (tracks) {
            //logger.debug("Got Track: ", JSON.stringify(tracks));
            callback(null, tracks);
        }
    });
};

var Track = mongoose.model("track", TrackSchema);
module.exports = Track;