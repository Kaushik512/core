var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Schema = mongoose.Schema;

var LogSchema = new Schema({
    referenceId: String,
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
                callback(err, null);
                return;
            }
            if (typeof callback === 'function') {
                callback(null, data);

            }
        });

    };

    this.getLogsByReferenceId = function(referenceId, timestamp, callback) {
        var queryObj = {
            referenceId: referenceId
        };

        if (timestamp) {
            
            queryObj.timestamp = {
                "$gt": timestamp
            };
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