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
        //logger.debug("Enter insertLog");
        var log = new Logs(logData);
        log.save(function(err, data) {
            if (err) {
                logger.error("Failed to insertLog", err);
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }

            //logger.debug("Exit insertLog", logData);
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
        logger.debug(timestampStarted, timestampEnded);
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

        logger.debug('queryObj ==>',queryObj);


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