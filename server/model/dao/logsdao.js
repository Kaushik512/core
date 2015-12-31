/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('_pr/logger')(module);

var Schema = mongoose.Schema;
var LogSchema = new Schema({
    referenceId: [String],
    err: Boolean,
    log: String,
    timestamp: Number
});
var Logs = mongoose.model('logs', LogSchema);

var LogsDao = function() {

    this.insertLog = function(logData, callback) {
        var log = new Logs(logData);
        log.save(function(err, data) {
            if (err) {
                logger.error("Failed to insertLog", err);
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }
            if (typeof callback === 'function') {
                callback(null, data);
            }
        });

    };

    this.getLogsByReferenceId = function(referenceId, timestamp, callback) {
        logger.debug("Enter getLogsByReferenceId ", referenceId, timestamp);
        var queryObj = {
            referenceId: {
                $in: [referenceId]
            }
        }

        if (timestamp) {

            queryObj.timestamp = {
                "$gt": timestamp
            };
        }

        Logs.find(queryObj, function(err, data) {
            if (err) {
                logger.debug("Failed to getLogsByReferenceId ", referenceId, timestamp, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit getLogsByReferenceId ", referenceId, timestamp);
            callback(null, data);
        });

    }

    this.getLogsByReferenceIdAndTimestamp = function(referenceId, timestampStarted, timestampEnded, callback) {
        var queryObj = {
            referenceId: {
                $in: [referenceId]
            }
        }
        if (timestampStarted) {
            queryObj.timestamp = {
                "$gt": timestampStarted
            };
            if (timestampEnded) {
                queryObj.timestamp.$lte = timestampEnded
            }
        }
        Logs.find(queryObj, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });

    }
}


module.exports = new LogsDao();
