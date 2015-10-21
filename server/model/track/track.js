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
        childItem: [{
            name:String,
            url:String
        }]
    }],
    description: String,
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

    logger.debug("Going to Update Track data: ", JSON.stringify(trackData));
    var setData = {};
    var keys = Object.keys(trackData);
    for (var i = 0; i < keys.length; i++) {
        setData[keys[i]] = trackData[keys[i]];
    }
    this.update({
        "_id": trackId
    }, {
        $set: setData
    }, {
        upsert: false
    }, function(err, updateCount) {
        if (err) {
            logger.debug("Got error while creating tracks: ", err);
            callback(err, null);
        }
        callback(null,updateCount);
        
    });
};

// Get all Track informations.
TrackSchema.statics.getTrackById = function(trackId, callback) {
    this.find({
        "_id": trackId
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
TrackSchema.statics.removeTracks = function(trackId, callback) {
    this.remove({
        "_id": trackId
    }, function(err, tracks) {
        if (err) {
            logger.debug("Got error while removing Tracks: ", err);
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